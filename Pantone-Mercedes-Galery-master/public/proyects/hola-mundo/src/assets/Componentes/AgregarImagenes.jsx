import "../Estilos/AgregarImagenes.css";
import { useState } from "react";
import { BarraCarga } from "./BarraCarga";
export function AgregarImagenes({id, setActualizarImagenes}) {

    const [cargando, setCargando] = useState(false);
    const [cantidadActual, setCantidadActual] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);
    console.log(id)
    function handleOnChangeInput(e){
        const cantidad = e.target.files.length;
        const strong = document.querySelector(".agregar-imagenes-strong");
        strong.innerText = `${cantidad} seleccionadas`;
    }
    async function handleOnSubmitActualizarFotos(event){
        event.preventDefault();
        setCargando(true);
        const fotos = event.target.file.files;
    
        let cantidadActualVariable = 0;
        let lote = 50;
        if(fotos.length < 50){
            lote = fotos.length;
        }
        setCantidadActual(0);
        setCantidadTotal(fotos.length); 
        setTimeout(() => {
            cantidadActualVariable = lote;
            setCantidadActual(lote);
        }, 700);       
        for(let i = 0 ; i < fotos.length; i += lote){
            const formData = new FormData();
            const subFotos = Array.from(fotos).slice(i, i + lote);
            subFotos.forEach(foto => {
                formData.append("fotos", foto);
            })
            await fetch(`http://localhost:3000/api/clientes/fotos/${id}`, {
                method: "PATCH",
                body: formData
            })
            .then(res => res.json())
            .then(data => {cantidadActualVariable += lote;
                if(cantidadActualVariable + lote > fotos.length){
                    cantidadActualVariable = fotos.length;
                }
                setCantidadActual(cantidadActualVariable);
                console.log("cantidad actual", cantidadActual);
            })
            .catch(err => console.error(err));
            if(i + lote >= fotos.length){
                lote = fotos.length - i;
                setCantidadActual(fotos.length);
            }
        }
        setCantidadActual(0);
        setCantidadTotal(0);
        setCargando(false);
        setActualizarImagenes(false);

    }

    function stopPropag(event){
        event.stopPropagation();
    }

    return(

        <>
        {cargando ? <BarraCarga cantidadActual={cantidadActual} cantidadTotal={cantidadTotal}/>
        :
        <div className="agregar-imagenes" onClick={()=>{setActualizarImagenes(false) }}>
        <form onSubmit={handleOnSubmitActualizarFotos} onClick={stopPropag} name="file">
            <h3>AGREGAR FOTOS</h3>
            <div className="agregar-imagenes-div">
                <label htmlFor="file">Seleccionar fotos</label>
                <input onChange={handleOnChangeInput} type="file" name="file" accept=".jpg,.jpeg,.png" id="file" className="inputfile" multiple required />
                <strong className="agregar-imagenes-strong">0 seleccionadas</strong>
            </div>
        <button>Aceptar</button>
        </form>
    </div>
        }

        </>

    )


}