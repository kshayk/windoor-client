import { NextResponse } from 'next/server';
import fs from 'fs';
import sharp from "sharp";
import path from "path";
const cloudinary = require('cloudinary');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Replace with your Cloudinary API key and API secret
cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
});

export async function POST(request) {
    const requestBody = await request.json();
    const file = requestBody.image;
    const door  = requestBody.door;
    const window = requestBody.window;

    if (!file) {
        //return status code 400
        return NextResponse.json({ "success": false });
    }

    // convert the base64 string to buffer with sharp

    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // get file type
    const fileMetadata = await sharp(buffer).metadata();
    const fileType = fileMetadata.format;

    const tempFileName = `${Math.random().toString(36).substring(7)}.${fileType}`;

    fs.writeFile(`tmp/${tempFileName}`, buffer, (err) => {
        if (err) throw err;
        console.log('Image saved!');
    });

    // send the file to localhost:80/image
    let imageRes = await fetch("http://localhost:80/image", {
        method: "POST",
        body: buffer,
        headers: {
            "Content-Type": `image/${fileType}`
        }
    });

    imageRes = await imageRes.json();

    const houseImage = sharp(`tmp/${tempFileName}`).toFormat('jpeg');
    const imageMetadata = await houseImage.metadata();
    const mainImageWidth = imageMetadata.width ?? 0;
    const mainImageHeight = imageMetadata.height ?? 0;

    let predictions = imageRes.predictions.filter((prediction) => {
        if (prediction.probability > 0.5) {
            return prediction;
        }
    }).map((prediction) => {
        return {
            left: prediction.boundingBox.left,
            top: prediction.boundingBox.top,
            width: prediction.boundingBox.width,
            height: prediction.boundingBox.height,
            tagName: prediction.tagName
        }
    });

    return NextResponse.json({ "success": true, predictions, tempFileName });
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

