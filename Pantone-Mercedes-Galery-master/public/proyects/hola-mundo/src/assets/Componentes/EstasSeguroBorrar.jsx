import "../Estilos/EstasSeguroBorrar.css";

export function EstasSeguroBorrar({clienteID, setEstasSeguroVisible, setActualizarApp}) {

    async function borrarCliente(){
        const id = clienteID;
        await fetch(`http://92.112.179.32:3000/api/clientes/borrar/${id}`, {
            method: "DELETE",
        })
        
        setActualizarApp(prev => !prev);
        setEstasSeguroVisible(null);

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