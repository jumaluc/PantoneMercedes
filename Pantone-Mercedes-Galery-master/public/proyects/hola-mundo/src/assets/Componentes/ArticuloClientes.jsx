import {X} from './Close.jsx';
import {Plus} from './Plus.jsx'
import '../Estilos/ArticuloClientes.css';
export function ArticuloClientes({nombre, apellido, id, url, setEstasSeguroVisible, handleClickAgregarImg, handleClick}) {

    const clienteNombre = `${nombre}  ${apellido}`;

    function handleClickX(event){
        event.stopPropagation();    
        setEstasSeguroVisible(id)
    }

    return(


        <div className='articulo-container' onClick={()=>handleClick(nombre,apellido,id)} id={id}>
            <header className='articulo-header'>
                <h3>{clienteNombre}</h3>
            </header>
            <img className='articulo-img'  src={url} alt={"imagen de cliente"} />
            <div className='articulo-div-iconos'>
                <Plus id={id} onClick={handleClickAgregarImg} className={'articulo-plus'}/>
                <X  id={id} onClick={handleClickX} className={'articulo-close'}/>
            </div>
        </div>


    )


}