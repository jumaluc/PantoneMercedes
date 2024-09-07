import { useState, useEffect } from "react";
import "../Estilos/PantonewebMain.css";
import { useNavigate } from "react-router-dom";
import { AgregarClientes } from "./AgregarClientes.jsx";
import { EstasSeguroBorrar } from "./EstasSeguroBorrar.jsx";
import { AgregarImagenes } from "./AgregarImagenes.jsx";
import { ArticuloClientes } from "./ArticuloClientes.jsx";
import {Plus} from './Plus.jsx'
import { BarraCarga } from "./BarraCarga.jsx";

export function PantoneWebMain({ setActualizarApp, actualizarApp }) {
    const [clientes, setClientes] = useState([]);
    const navigate = useNavigate(); 
    const [formVisible, setFormVisible] = useState(false);
    const [estasSeguroVisible, setEstasSeguroVisible] = useState(null);
    const [actualizarImagenes, setActualizarImagenes] = useState(false);
    const [id, setId] = useState(null);
    const [cantidadActual, setCantidadActual] = useState(0);
    const [cantidadTotal, setCantidadTotal] = useState(0);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        fetch("http://localhost:3000/home/clientes/")
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
                {formVisible && <AgregarClientes setActualizarApp={setActualizarApp} setFormVisible={setFormVisible} setCargando={setCargando} setCantidadActual={setCantidadActual} setCantidadTotal={setCantidadTotal}/>}
                {actualizarImagenes && <AgregarImagenes id={id} setActualizarApp={setActualizarApp} setActualizarImagenes={setActualizarImagenes} setCargando={setCargando} setCantidadActual={setCantidadActual} setCantidadTotal={setCantidadTotal} />}
                {estasSeguroVisible !== null && <EstasSeguroBorrar clienteID={estasSeguroVisible} setActualizarApp={setActualizarApp} setEstasSeguroVisible={setEstasSeguroVisible} setCantidadActual={setCantidadActual} setCantidadTotal={setCantidadTotal} setCargando={setCargando}  />}
                {cargando && <BarraCarga cantidadActual={cantidadActual} cantidadTotal={cantidadTotal} />}
            </section>
           

        </main>
    );
}
