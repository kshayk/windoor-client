import DoorBox from "@/app/house/DoorBox";
import styles from "./box.module.css";

export default function DoorsSection({onDoorSelected, doors}) {
    return (
        <div>
            {doors && doors.map((door) => {
                return <DoorBox key={door} className={styles.box} onDoorSelected={onDoorSelected} imgName={door}/>
            })}
        </div>
    );
}