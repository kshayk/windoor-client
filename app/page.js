"use client";
import styles from './page.module.css'
import WindowsSection from "./house/WindowSection";
import DoorsSection from "./house/DoorSection";
import {useEffect, useRef, useState} from "react";
import Image from "next/image";

export default function Home() {
    const [windows, setWindows] = useState(["window1.png", "window2.webp", "window3.jpg"]);
    const [doors, setDoors] = useState(["door3.jpg"]);
    const [imgUrl, setImgUrl] = useState("");
    const [prevImgUrl, setPrevImgUrl] = useState("");
    // const [selectedWindow, setSelectedWindow] = useState("");
    // const [selectedDoor, setSelectedDoor] = useState("");
    // const [selectedImage, setSelectedImage] = useState("");

    const selectedImage = useRef("");
    const selectedWindow = useRef("");
    const selectedDoor = useRef("");

    const onWindowSelected = (windowSelected) => {
        selectedWindow.current = windowSelected;
    }

    const onDoorSelected = (door) => {
        selectedDoor.current = door;
    }

    const onFileUploaded = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            selectedImage.current = reader.result;
        };

        setImgUrl(URL.createObjectURL(e.target.files[0]));
        setPrevImgUrl("");
    }

    const onFormSend = () => {
        if (!selectedImage.current) {
            alert("Please select an image");
            return;
        }

        if (!selectedWindow.current) {
            alert("Please select a window");
            return;
        }

        if (!selectedDoor.current) {
            alert("Please select a door");
            return;
        }

        const formData = new FormData();
        // convert selected image to base64 in the next line

        // send for data to /house with post
        fetch("/house", {
            method: "POST",
            body: JSON.stringify({
                "image": selectedImage.current,
                "window": selectedWindow.current,
                "door": selectedDoor.current
            })
        }).then((res) => {
            res.json().then((data) => {
                setPrevImgUrl(imgUrl);
                setImgUrl(data.img_url);
                // setWindows(data.windows);
                // setDoors(data.doors);
            });
        });
    }

    const onImgClicked = () => {
        let prevImg = prevImgUrl;
        setPrevImgUrl(imgUrl);
        setImgUrl(prevImg);
    }

    return (
        <main className={styles.main}>
            <div className={styles.uploadSection}>
                Upload your image here (jpg, png):
                <input type="file" onChange={onFileUploaded} name="image" accept="image/*" required/>
                <div></div>
                {imgUrl && <Image src={imgUrl} onClick={onImgClicked} width={500} height={500}/>}
                Choose the window that you like:
                <WindowsSection windows={windows} onWindowSelected={onWindowSelected}/>
                Choose the door that you like:
                <DoorsSection doors={doors} onDoorSelected={onDoorSelected}/>
                <button type="button" onClick={onFormSend}>Send</button>
            </div>
        </main>
    );
}