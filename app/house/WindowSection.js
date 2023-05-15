import WindowBox from "@/app/house/WindowBox";
import styles from "./box.module.css";

export default function WindowsSection({onWindowSelected, windows}) {
    return (
        <div>
            {windows && windows.map((window) => {
                return <WindowBox key={window} className={styles.box} onWindowSelected={onWindowSelected} imgName={window}/>
            })}
        </div>
    );
}