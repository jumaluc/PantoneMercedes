import "../Estilos/AgregarImagenes.css";
import { CargandoCliente } from "./CargandoCliente";
import { useState } from "react";
export function AgregarImagenes({id, setActualizarImagenes}) {

    const [cargando, setCargando] = useState(false);

    function handleOnChangeInput(e){
        const cantidad = e.target.files.length;
        const strong = document.querySelector(".agregar-imagenes-strong");
        strong.innerText = `${cantidad} seleccionadas`;
    }
    function handleOnSubmitActualizarFotos(event){
        event.preventDefault();
        setCargando(true);
        const formData = new FormData();
        const files = event.target.file.files;
        console.log("files  ",files);
        Array.from(files).forEach((file) => {
            formData.append(`files`, file);
        })


        fetch(`http://92.112.179.32:3000/api/clientes/fotos/${id}`, {
            method: "PATCH",
            body: formData
        })
        .then(res => res.json())
        .then(data => {setCargando(false); setActualizarImagenes(false)})
        .catch(err => console.error(err));

    }

    function stopPropag(event){
        event.stopPropagation();
    }

    return(

        <>
        {cargando ? <CargandoCliente /> : null}
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
        </>

    )


}