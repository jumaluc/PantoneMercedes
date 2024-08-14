import "../Estilos/AgregarClientes.css";
import { useState } from "react";
import { CargandoCliente } from "./CargandoCliente";

export function AgregarClientes({ setFormVisible, setActualizarApp }) {

    const [cargando, setCargando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setCargando(true);
        const nombre = e.target.nombre.value;
        const apellido = e.target.apellido.value;
        const fotos = e.target.fotos.files
        const formData = new FormData();
        const fotoPrincipal =  seleccionarFotosVertical(fotos) ?? fotos[0].name;
        formData.append("nombre", nombre);
        formData.append("apellido", apellido);
        formData.append("fotoPrincipal", fotoPrincipal);
       
        Array.from(fotos).forEach((file) => {
            formData.append(`fotos`, file);
        })  

        await fetch("http://92.112.179.32:3000/api/agregarCliente/", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            setCargando(false);})
        .catch(err =>{ 
            console.error("Error en la API " + err)
            setCargando(false);

        });
        
        setActualizarApp(prev => !prev);
        setFormVisible(prev => !prev)

    }
    function seleccionarFotosVertical(fotos){
        Array.from(fotos).forEach((file) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                if(width < height){
                    return  file.name;
                }
            }
        })
        return
    }
    function handleOnChangeInput(e){
        const cantidad = e.target.files.length;
        const strong = document.querySelector(".agregar-imagenes-strong");
        strong.innerText = `${cantidad} seleccionadas`;
    }

    return (
        <>
                {cargando ?      <CargandoCliente /> : null}  
            <section >
                <main className="agregarClientes-main" onClick={()=>{setFormVisible(false)}}>
                    <form onSubmit={handleSubmit} onClick={(event)=>{event.stopPropagation()}}>
                        <h3>Nuevo Cliente</h3>
                        <input type="text" id="nombre" name="nombre" placeholder="Nombre" required />
                        <input type="text" id="apellido" name="apellido" placeholder="Apellido" required />
                        <label  className="agregarClientes-label-files" htmlFor="fotos">Seleccionar Fotos</label>
                        <input onChange={handleOnChangeInput} className="inputdisplaynone"   type="file" id="fotos" name="fotos" accept=".jpg,.png,.jpeg" multiple />
                        <strong className="agregar-imagenes-strong">0 seleccionadas</strong>

                        <button type="submit" className="agregarClientes-button">Agregar</button>
                    </form>
                </main>
            </section>
        </>
    );
}
