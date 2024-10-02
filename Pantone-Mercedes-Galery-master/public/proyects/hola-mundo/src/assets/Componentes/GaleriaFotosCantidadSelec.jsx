import {X} from './Close.jsx';
import {Send} from './Send.jsx';
import "../Estilos/GaleriaFotosCantidadSelec.css";
import {Camera} from './camera.jsx';
export function GaleriaFotosCantidadSelec({cant, nombreApellido ,setContenido , setCantidadImgSeleccionadas, setInformacionImgCheckeada, setIndexImgCheckeada, informacionImgCheckeada, setMostrarPostSubida, clienteKey, setVerFotosSeleccionadas}){ 



    let seleccionadas = cant;

    if(seleccionadas !== 1){
         seleccionadas = `${cant} Seleccionadas`;
    }
    else{
         seleccionadas = `${cant} Seleccionada`;
    }

    function handleClickCerrar(){   
        setCantidadImgSeleccionadas(0);
        setInformacionImgCheckeada([]);
        setIndexImgCheckeada([]);
        localStorage.removeItem(clienteKey);
    }

  

    async function mandarFotosCloud(event){
        event.stopPropagation();
        setVerFotosSeleccionadas(true);
        const filesURL = informacionImgCheckeada;
        console.log("filesURL : ", filesURL)
        setMostrarPostSubida(true);
        // await fetch(`http://localhost:3000/enviarFotos?nombre=${nombreApellido}`, {
        //     method: "POST",
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ urls: filesURL }),
            
        // })

        // .then(response => response.json())
        // .then(data => 
        //     {
                
        //         setContenido("¡Fotos enviadas correctamente!");
        //         setCantidadImgSeleccionadas(0);
        //         setInformacionImgCheckeada([]);
        //         setIndexImgCheckeada([]);
        //     }

        // )
        // .catch(err => console.error(err))

    }

    return (

        <>
            

            <header className="seleccionador-header cantSelec-header">
            <div className="seleccionador-div">
                <Camera className="camera"/>
                <div className="seleccionador-div-texto2">
                    <X className="selecionador-close" onClick={handleClickCerrar}/>
                    <label>{seleccionadas}</label>
                </div>
                <div className="seleccionador-div-iconos-2">
                 <label className='mandarFotos verSeleccionadas'>Ver Seleccionadas</label>
                    <label onClick={mandarFotosCloud} className='mandarFotos enviar'>Enviar</label>
                   {/* <Send className='seleccionador-send' onClick={mandarFotosCloud}/> */} 
                </div>
            </div>
        </header>
        </>
    )
}