export default async function WindowBox(props) {
    let imgPath = `/windows/${props.imgName}`;

    const setWindowState = (event) => {
        props.onWindowSelected(event.target.value);
    }

    return (
        <>
            <input onChange={setWindowState}
                   type="radio" id={props.imgName} name="window" value={props.imgName} className="input-hidden"/>
            <label htmlFor={props.imgName}>
                <img src={imgPath}/>
            </label>
        </>
    )
}