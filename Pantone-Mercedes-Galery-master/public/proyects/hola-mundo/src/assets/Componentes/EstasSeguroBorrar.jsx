import "../Estilos/EstasSeguroBorrar.css";
import { BarraCarga } from "./BarraCarga";
export function EstasSeguroBorrar({clienteID, setEstasSeguroVisible, setActualizarApp, setCargando, setCantidadActual, setCantidadTotal}) {


    async function borrarCliente(){
        const id = clienteID;
        setEstasSeguroVisible(null);
        setCargando(true);
        await fetch(`http://localhost:3000/api/clientes/borrar/${id}`, {
            method: "DELETE",
        })
        setCantidadActual(1);
        setCantidadTotal(1);
        setTimeout(() => {
            setActualizarApp(prev => !prev);
            setCantidadActual(0);
            setCantidadTotal(0);
            setCargando(false);
        }, 1000);


    }

    return (

        <section className="estasSeguro-section">
            <main className="estasSeguro-section-main">
                <h3 className="estasSeguro-section-h3">¿Estás seguro de borrar al cliente?</h3>
                <div>
                    <button className="estasSeguro-section-b" onClick={borrarCliente}>Si</button>
                    <button className="estasSeguro-section-b" onClick={()=>setEstasSeguroVisible(null)}>No</button>
                </div>
            </main>
        </section>



    )
}