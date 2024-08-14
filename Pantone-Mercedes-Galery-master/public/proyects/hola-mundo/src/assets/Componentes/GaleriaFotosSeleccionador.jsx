import "../Estilos/GaleriaFotosSeleccionador.css";
import {Check} from "./Check.jsx";
import {Send} from "./Send.jsx";
import { Camera } from "./camera.jsx";
export function GaleriaFotosSeleccionador({informacionImgCheckeada}){




    return(
        <header className="seleccionador-header">
            <div className="seleccionador-div-1">
                <div className="seleccionador-div-texto">
                    <h3>¡SELECCIONE LAS FOTOS QUE LE GUESTEN!</h3>
                    <strong>PANTONE MERCEDES</strong>
                </div>
                <Camera className={"cameraSeleccionador"}/>
            </div>
        </header>
    )
}