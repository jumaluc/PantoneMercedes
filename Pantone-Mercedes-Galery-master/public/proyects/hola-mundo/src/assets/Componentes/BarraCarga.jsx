import "../Estilos/BarraCarga.css";

export function BarraCarga({ cantidadActual, cantidadTotal }) {

    const porcentaje = (cantidadTotal !==0) ? (cantidadActual / cantidadTotal) * 100 : 0;
    console.log("cantidadActual > ", cantidadActual);
    console.log("cantidadTotal > ", cantidadTotal);
    console.log("porcentaje > ", porcentaje);

    return (
        <div className="barraCargaTotal">
            <div className="barraCarga">
                <h4>
                    Espere un momento.
                </h4>
                <div className="barraCarga__abarcador">
                     <strong>{`${porcentaje.toFixed(0)}%`}</strong>
                    <div className="barraCarga__progreso" style={{width:`${porcentaje}%`}}> 
                    </div>
                </div>
            </div>
        </div>
    )
}