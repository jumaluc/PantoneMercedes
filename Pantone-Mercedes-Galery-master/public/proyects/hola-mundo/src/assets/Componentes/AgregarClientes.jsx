import "../Estilos/AgregarClientes.css";

export function AgregarClientes({ setFormVisible, setActualizarApp, setCargando, setCantidadActual, setCantidadTotal }) {



    async function handleSubmit(e) {
        e.preventDefault();
        setCargando(true);
        setFormVisible(false);
        let cantidadActualVariable = 0;
        const nombre = e.target.nombre.value;
        const apellido = e.target.apellido.value;
        const fotos = e.target.fotos.files;
        const fotoPrincipal =  seleccionarFotosVertical(fotos) ?? fotos[0].name;

        let lote = 200;
        if(fotos.length < 200){
            lote = fotos.length;
        }
        setCantidadActual(0);
        setCantidadTotal(fotos.length);
        setTimeout(() => {
            cantidadActualVariable = lote;
            setCantidadActual(lote);
        }, 700);

        for(let i = 0 ; i < fotos.length; i += lote){
            const data = new FormData();
            const subFotos = Array.from(fotos).slice(i, i + lote);
            subFotos.forEach(foto => {
                data.append("fotos", foto);
            });
            data.append("nombre", nombre);
            data.append("apellido", apellido);
            data.append("fotoPrincipal", fotoPrincipal);

            await fetch("http://localhost:3000/api/agregarCliente/", {
                method: "POST",
                body: data
            })
            .then(response => response.json())
            .then(data => {
                cantidadActualVariable += lote;
                if(cantidadActualVariable + lote > fotos.length){
                    cantidadActualVariable = fotos.length;
                }
                setCantidadActual(cantidadActualVariable);    
               })
            .catch(err =>{ 
                console.error("Error en la API " + err)
                setCargando(false);
    
            });
            if(i + lote >= fotos.length){
                lote = fotos.length - i;
                setCantidadActual(fotos.length);

            }
        }
        setCantidadActual(0);
        setCantidadTotal(0);
        setCargando(false);
        setActualizarApp(prev => !prev);

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
