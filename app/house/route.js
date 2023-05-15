import { NextResponse } from 'next/server';
import fs from 'fs';
import sharp from "sharp";

export async function POST(request: Request) {
    // get file binary from request
    const file = await request.blob();

    // turn "file" into in image file that i can save in my system


    if (!file) {
        //return status code 400
        return NextResponse.json({ "success": false });
    }

    // get file type
    const fileType = file.type.split("/")[1];

    const tempFileName = `${Math.random().toString(36).substring(7)}.${fileType}`;
    const buffer = await file.arrayBuffer();

    fs.writeFile(`tmp/${tempFileName}`, Buffer.from(buffer), (err) => {
        if (err) throw err;
        console.log('Image saved!');
    });

    // send the file to localhost:80/image
    let imageRes = await fetch("http://localhost:80/image", {
        method: "POST",
        body: file,
        headers: {
            "Content-Type": `image/${fileType}`
        }
    });

    imageRes = await imageRes.json();

    const houseImage = sharp(`tmp/${tempFileName}`).toFormat('png');
    const imageMetadata = await houseImage.metadata();
    const mainImageWidth = imageMetadata.width ?? 0;
    const mainImageHeight = imageMetadata.height ?? 0;

    // @ts-ignore
    let predictions = imageRes.predictions.filter((prediction) => {
        if (prediction.probability > 0.5) {
            return prediction;
        }
    }).map((prediction) => {
        return {
            left: prediction.boundingBox.left * mainImageWidth,
            top: prediction.boundingBox.top * mainImageHeight,
            width: prediction.boundingBox.width * mainImageWidth,
            height: prediction.boundingBox.height * mainImageHeight,
            tagName: prediction.tagName
        }
    });

    compositeImage(predictions).then((compositeImages) => {
        let outputFileName = `${Math.random().toString(36).substring(7)}.png`;
        houseImage.composite(compositeImages).toFile(`public/output/output_${outputFileName}`).then(() => {
            console.log('done');
        });
    });

    console.log("my predictions", predictions);

    return NextResponse.json({ "success": true });
}

async function compositeImage(predictions ) {
    let compositeImages = [];
    for (const prediction of predictions) {
        let inputImageName = (prediction.tagName === 'window' ? 'public/windows/window3.jpg' : 'public/doors/door3.jpg');
        let inputImage = await sharp(inputImageName).resize(Math.round(prediction.width), Math.round(prediction.height), { fit: 'fill', withoutEnlargement: true } ).toFormat('png').toBuffer();
        let left = Math.round(prediction.left);
        let top = Math.round(prediction.top);
        compositeImages.push({ input: inputImage, left, top });
    }

    return compositeImages;
}