"use client";
import styles from './page.module.css'
import WindowsSection from "./house/WindowSection";
import DoorsSection from "./house/DoorSection";
import {useEffect, useState} from "react";

export default async function Home() {
    const [windows, setWindows] = useState(["window1.png", "window2.webp", "window3.jpg"]);
    const [doors, setDoors] = useState(["door3.jpg"]);
    const [selectedWindow, setSelectedWindow] = useState(null);
    const [selectedDoor, setSelectedDoor] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        alert("Please upload an image");
    }, []);

    const onWindowSelected = (window) => {
        setSelectedWindow(window);
    }

    const onDoorSelected = (door) => {
        setSelectedDoor(door);
    }

    const onFileUploaded = (e) => {
        // save file in the selectedImage state
        console.log("file", e.target.files[0]);
        // setSelectedImage(e.target.files[0]);
    }

    const onFormSend = () => {
        if (!selectedImage) {
            alert("Please select an image");
            return;
        }

        if (!selectedWindow) {
            alert("Please select a window");
            return;
        }

        if (!selectedDoor) {
            alert("Please select a door");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedImage);

        // send for data to /house with post
        fetch("/house", {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
                "Window": selectedWindow,
                "Door": selectedDoor
            }
        }).then((res) => {
            res.json().then((data) => {
                console.log("data", data);
                // setWindows(data.windows);
                // setDoors(data.doors);
            });
        });
    }

    return (
        <main className={styles.main}>
            <div className={styles.uploadSection}>
                Upload your image here (jpg, png):
                <input type="file" onChange={onFileUploaded} name="image" accept="image/*" required/>
                <div></div>
                Choose the window that you like:
                <WindowsSection windows={windows} onWindowSelected={onWindowSelected}/>
                Choose the door that you like:
                <DoorsSection doors={doors} onDoorSelected={onDoorSelected}/>
                <button type="button" onClick={onFormSend}>Send</button>
            </div>
        </main>
    );
}