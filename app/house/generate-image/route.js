import sharp from "sharp";
import fs from "fs";
import cloudinary from "cloudinary";
import {NextResponse} from "next/server";
import path from "path";

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Replace with your Cloudinary API key and API secret
cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
});

export async function POST(request) {
    const requestBody = await request.json();
    const { predictions, door, window, image} = requestBody;

    const houseImage = sharp(`tmp/${image}`).toFormat('jpeg');

    const imageMetadata = await houseImage.metadata();
    const mainImageWidth = imageMetadata.width ?? 0;
    const mainImageHeight = imageMetadata.height ?? 0;

    let mappedPredictions = predictions.map((prediction) => {
        return {
            left: prediction.left * mainImageWidth,
            top: prediction.top * mainImageHeight,
            width: prediction.width * mainImageWidth,
            height: prediction.height * mainImageHeight,
            tagName: prediction.tagName
        }
    });

    const resultImage = await compositeImage(mappedPredictions, window, door);

    const outputFileName = `${Math.random().toString(36).substring(7)}.png`;
    const resultImageFilePath = `public/output/output_${outputFileName}`;
    await houseImage.composite(resultImage).toFile(resultImageFilePath);

    const cloudinaryRes = await uploadImage(resultImageFilePath, outputFileName);

    // delete the file from tmp folder
    fs.unlink(`tmp/${image}`, (err) => {
        if (err) throw err;
        console.log('Image deleted!');
    });

    fs.unlink(resultImageFilePath, (err) => {
        if (err) throw err;
        console.log('Image deleted!');
    });

    return NextResponse.json({ "success": true, img_url: cloudinaryRes.secure_url });
}

async function compositeImage(predictions, windowName, doorName) {
    let compositeImages = [];
    for (const prediction of predictions) {
        let inputImageName = (prediction.tagName === 'window' ? `public/windows/${windowName}` : `public/doors/${doorName}`);
        let inputImage = await sharp(inputImageName).resize(Math.round(prediction.width), Math.round(prediction.height), { fit: 'fill', withoutEnlargement: true } ).toFormat('png').toBuffer();
        let left = Math.round(prediction.left);
        let top = Math.round(prediction.top);
        compositeImages.push({ input: inputImage, left, top });
    }

    return compositeImages;
}

async function uploadImage(imgUrl, fileName) {
    // Upload the file to Cloudinary
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(imgUrl, {resource_type: "image", folder:"windoor", public_id: `${fileName}`}, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}