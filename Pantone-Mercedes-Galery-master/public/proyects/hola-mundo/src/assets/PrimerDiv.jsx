import {useState} from "react"



export function PrimerDiv({children,contenido}){
    const [state, setState] = useState(false)
    const text = state ? "Seguir" : "Siguiendo"
    const handleClick = () => {
        setState(!state)
    }
    return (
        <button onClick={handleClick}>{text}</button>
    )
}