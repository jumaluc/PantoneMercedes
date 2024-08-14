import "../Estilos/PostSubidaFotos.css";
import Confetti from 'react-confetti';

export function PostSubidaFotos({setMostrarPostSubida, contenido, setContenido}) {


    let boton = false;

    if(contenido === "¡Fotos enviadas correctamente!"){
        boton = true;
    }

    function handleOnClickButtom(event){
        event.stopPropagation();
        setMostrarPostSubida(false);
        setContenido("Espere unos segundos ...");


    }

    return (

            <div className="postSubidaFotos-div">
 
                <div className="postSubidaFotos-div-div">
                {boton ? <Confetti width={window.innerWidth} height={window.innerHeight} /> : null} 

                    <h3>
                        {contenido}
                    </h3>
                {boton ?  <button onClick={handleOnClickButtom}>Aceptar</button> : null}
                </div>
            </div>
    )
}