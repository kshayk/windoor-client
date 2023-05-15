import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request: Request) {
    // get files from public/doors
    const windows = fs.readdirSync("public/windows");
    const doors = fs.readdirSync("public/doors");

    return NextResponse.json({ windows, doors });
}