import { useState, useEffect } from "react";
import "../Estilos/PantonewebMain.css";
import { useNavigate } from "react-router-dom";
import { AgregarClientes } from "./AgregarClientes.jsx";
import { IconoCerrarAct } from "./IconoCerrarAct.jsx";
import { EstasSeguroBorrar } from "./EstasSeguroBorrar.jsx";
import { AgregarImagenes } from "./AgregarImagenes.jsx";
import { ArticuloClientes } from "./ArticuloClientes.jsx";
import {Plus} from './Plus.jsx'

export function PantoneWebMain({ setActualizarApp, actualizarApp }) {
    const [clientes, setClientes] = useState([]);
    const navigate = useNavigate(); 
    const [formVisible, setFormVisible] = useState(false);
    const [cerrarVisible, setCerrarVisible] = useState(null);
    const [estasSeguroVisible, setEstasSeguroVisible] = useState(null);
    const [actualizarImagenes, setActualizarImagenes] = useState(false);
    const [id, setId] = useState(null);

    useEffect(() => {
        fetch("http://92.112.179.32:3000/home/clientes/")
            .then(response => response.json())
            .then(data => {setClientes(data);})
            .catch(err => console.error("Error en la API " + err));
    }, [actualizarApp]);

    function handleClick(nombre, apellido, id) {
        navigate(`/cliente/${id}/${nombre}/${apellido}`);
    }


    function handleClickAgregarImg(event){
        event.stopPropagation();
        setId(event.target.id)
        setActualizarImagenes(true);
    }

//     <div key={cliente.id} className="pantoneweb-div"  

//     onClick={() => handleClick(cliente)}>
//    {cerrarVisible === cliente.id && (
//        <div className="pantoneweb-icono-container">
//        <img onClick={(e)=>{handleClickAgregarImg(e, cliente.id)}} className="pantoneweb-icono-agregar" src="https://cdn.icon-icons.com/icons2/1875/PNG/512/plus_120249.png" alt="imagen"/>

//        </div>
//    )}
//    <strong className="pantoneweb-strong">{cliente.nombre}</strong>
//    <strong className="pantoneweb-strong">{cliente.apellido}</strong>
// </div>


    return (
        <main className="pantonewen-main">
            <section className="pantoneweb-section">
                {clientes.length > 0 ? (
                    clientes.map(cliente => (

                        <>
                        <ArticuloClientes handleClick={handleClick} handleClickAgregarImg={handleClickAgregarImg} setEstasSeguroVisible={setEstasSeguroVisible} id={cliente.id} nombre={cliente.nombre} apellido={cliente.apellido} url={cliente.fotoPrincipal} />

                        </>
                    ))
                ) : (
                    <p>No hay clientes disponibles</p>
                )}
                <div className="container-plus" onClick={() => setFormVisible(true)}>   <Plus className="pantoneweb-plus" onClick={() => setFormVisible(true)}/></div> 
                {formVisible && <AgregarClientes setActualizarApp={setActualizarApp} setFormVisible={setFormVisible} />}
                {actualizarImagenes && <AgregarImagenes id={id} setActualizarImagenes={setActualizarImagenes} />}
                {estasSeguroVisible !== null && <EstasSeguroBorrar clienteID={estasSeguroVisible} setActualizarApp={setActualizarApp} setEstasSeguroVisible={setEstasSeguroVisible} />}
            </section>
           

        </main>
    );
}
