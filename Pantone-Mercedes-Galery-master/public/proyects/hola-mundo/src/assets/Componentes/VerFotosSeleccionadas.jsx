import { LazyLoadComponent } from 'react-lazy-load-image-component';
import "../Estilos/verFotosSeleccionadas.css";


export function VerFotosSeleccionadas({ setVerFotosSeleccionadas,fotosSeleccionadas }) {


  fotosSeleccionadas.map((foto) => {
    console.log(foto)
  })

  return (
            <div className='verFotosSeleccionadasOverlay'>
              <div className='container'>
                <div className='header'>
                  <h5>Estas son las fotos que seleccionaste</h5>
                  <button onClick={() => setVerFotosSeleccionadas(false)}>Cerrar</button>
                </div>
                <div className='galeria'>
                  <div className="containerImagenes">
                    {fotosSeleccionadas.map((foto, index) => (
                      <LazyLoadComponent key={index} threshold={200}>
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="fotosSeleccionadas"
                        />
                      </LazyLoadComponent>
                    ))}
                  </div>
                </div>
              </div>
            </div>
  );
}