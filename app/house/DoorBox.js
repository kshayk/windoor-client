export default function DoorBox(props) {
    let imgPath = `/doors/${props.imgName}`;

    const setDoorState = (event) => {
        props.onDoorSelected(event.target.value);
    }

    return (
        <>
            <input onChange={setDoorState}
                   type="radio" id={props.imgName} name="door" value={props.imgName} className="input-hidden"/>
            <label htmlFor={props.imgName}>
                <img src={imgPath}/>
            </label>
        </>
    )
}