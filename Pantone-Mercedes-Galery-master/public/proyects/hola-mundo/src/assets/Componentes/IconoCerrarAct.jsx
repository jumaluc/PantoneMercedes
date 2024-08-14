import "../Estilos/IconoCerrar.css";

export function IconoCerrarAct({clase, clienteID , setEstasSeguroVisible}) {

    async function clickBoton(e){
        console.log(clienteID)
        e.stopPropagation();
        setEstasSeguroVisible(clienteID);

        
    }

    return (
        <button onClick={clickBoton} className={`iconoCerrarClose ${clase}`} ><img src={"https://cdn-icons-png.flaticon.com/128/458/458594.png"} alt="iconoCerrar" /></button>
    )
}