import { useParams } from "react-router-dom";
import "../Estilos/GaleriaFotos.css";
import { useState,useEffect, useRef } from "react";
import { OverlayImagen } from "./OverlayImagen";
import { GaleriaFotosSeleccionador } from "./GaleriaFotosSeleccionador";
import {Check} from "./Check.jsx";
import { GaleriaFotosCantidadSelec } from "./GaleriaFotosCantidadSelec.jsx";
import { MagicMotion } from "react-magic-motion";
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import {ZoomIn} from "./Zoom.jsx";
import { PostSubidaFotos } from './PostSubidaFotos.jsx';
import Confetti from 'react-confetti';

export function GaleriaFotos(){
    const {id, nombre, apellido} = useParams();
    const [imagenes, setImagenes] = useState([]);
    let nombreApellido = nombre.toLocaleUpperCase() + " " + apellido.toLocaleUpperCase();
    const [selectedImage, setSelectedImage] = useState(null); 
    const [overlayVisible, setOverlayVisible] = useState(false); 
    const [checkVisible, setCheckVisible] = useState(null);  
    const [informacionImgCheckeada, setInformacionImgCheckeada] = useState([]);
    const [indexImgCheckeada, setIndexImgCheckeada] = useState([]);
    const [cantidadImgSeleccionadas, setCantidadImgSeleccionadas] = useState(0);
    const [overlayIndex , setOverlayIndex] = useState(null);
    const [claseCheckOverlay, setClaseCheckOverlay] = useState("");
    const [mostrarPostSubida, setMostrarPostSubida] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const galeriaRef = useRef(null);
    const [contenido , setContenido] = useState("Espere unos segundos ...");
    const [isMobile, setIsMobile] = useState(false);
    const [mostrarClaseCheckAzul, setMostrarClaseCheckAzul] = useState(null);
    const [mostrarHoverCheck, setMostrarHoverCheck] = useState(null);
    const headerRef = useRef(null);
    const [touchTimer, setTouchTimer] = useState(null);
    const [startTouchY, setStartTouchY] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const holdTimeout = useRef(null);

    if(nombreApellido.length > 20){
        nombreApellido = nombre.toLocaleUpperCase() + " " + apellido[0].toUpperCase() + ".";

    }


    useEffect(() => {
        setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|webOS/i.test(navigator.userAgent));
        if (headerRef.current) {
            headerRef.current.scrollIntoView({ behavior: 'smooth' });
        }


    }, []);



    useEffect(() => {
        fetch(`http://92.112.179.32:3000/api/clientes/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
            
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error en la API");
            }
            return response.json();
        })
        .then(data => { 
            setImagenes(data)
        })
        .catch(err => console.error("Error en la API " +err))
    },[])


    const handleImageLoad = (event) => {
        const img = event.target;
        const parent = img.parentElement;
        const { naturalWidth, naturalHeight } = img;
        
        if (naturalHeight > naturalWidth) {
            
            parent.classList.add("vertical");
        } else {
            
            parent.classList.add("horizontal");

        }
    };
    const handleImageClick = (url, index) => {

        if(cantidadImgSeleccionadas !== 0){
            if(indexImgCheckeada.includes(index)){
                setIndexImgCheckeada(indexImgCheckeada.filter((imgIndex) => imgIndex !== index));
                setInformacionImgCheckeada(informacionImgCheckeada.filter((img,indexImg) => indexImg !== index));
                setCantidadImgSeleccionadas(cantidadImgSeleccionadas - 1);
                return;
            }
            setCantidadImgSeleccionadas(cantidadImgSeleccionadas + 1);
            setIndexImgCheckeada([...indexImgCheckeada,index]);
            setInformacionImgCheckeada([...informacionImgCheckeada, imagenes[index]]);
        }
        else{
            if(indexImgCheckeada.includes(index)){
                setClaseCheckOverlay("overlay-check-clicked");
            }
            else{
                setClaseCheckOverlay(" ");
            }
            setSelectedImage(url);
            setOverlayIndex(index);
            setOverlayVisible(true);
        }
    };
    const handleClickZoom = (url, index) => {

        if(indexImgCheckeada.includes(index)){

            setClaseCheckOverlay("overlay-check-clicked");
        }
        else{
            setClaseCheckOverlay(" ");
        }

        setSelectedImage(url);
        setOverlayIndex(index);
        setOverlayVisible(true);


    }
    const handleOverlayClose = () => {
        setOverlayVisible(false);
        setSelectedImage(null);
    };
    const handleClickImgCheckeada = (event = null, index) => {

        if(event !== null && event !== undefined){
            event.stopPropagation();
        }

        console.log("entro al img ckecead")
        console.log("Handle Click index: " + index)
        if(event === null){
            event.stopPropagation();
        }
        if(claseCheckOverlay === "overlay-check-clicked"){
            setClaseCheckOverlay(" ");
        }
        else{
            setClaseCheckOverlay("overlay-check-clicked");
        }
        
        if(indexImgCheckeada.includes(index)){
            setIndexImgCheckeada(indexImgCheckeada.filter((imgIndex) => imgIndex !== index));
            setInformacionImgCheckeada(informacionImgCheckeada.filter((img,indexImg) => indexImg !== index));
            setCantidadImgSeleccionadas(cantidadImgSeleccionadas - 1);
            return;
        }
        setCantidadImgSeleccionadas(cantidadImgSeleccionadas + 1);
        setIndexImgCheckeada([...indexImgCheckeada,index]);
        setInformacionImgCheckeada([...informacionImgCheckeada, imagenes[index]]);

    }
    const scrollToGallery = () => {
        if (galeriaRef.current) {
            galeriaRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const overLayOnClick = (event) => {
        event.stopPropagation();
        console.log("click en overlay");
    }


    const [mobilClick, setMobilClick] = useState(false);

    const handleTouchStart = (event, index) => {
        if(cantidadImgSeleccionadas > 0){
            return;
        }

        setIsHolding(true);

        holdTimeout.current = setTimeout(() => {
          setIsHolding(false);
          const element = event.target;
          handleClickImgCheckeada(event, index);
          element.style.backgroundColor = "blue";
        }, 500); 
        
    };
    const handleTouchEnd = (event) => {
        
        if(cantidadImgSeleccionadas === 0){
            event.preventDefault();

        }

        if(cantidadImgSeleccionadas > 0){

            return;
        }
        else{
            event.preventDefault();

        }

        clearTimeout(holdTimeout.current);
        setIsHolding(false);
    };
    const handleTouchMove = (e) => {
        const currentTouchY = e.touches[0].clientY;
        if (Math.abs(currentTouchY - startTouchY) > 10) { 
          clearTimeout(holdTimeout.current);
          setIsHolding(false);
        }
      };
      const onClickMobileImg = (event, index) => {
        if(cantidadImgSeleccionadas > 0){
            event.preventDefault();
            handleClickImgCheckeada(event, index);
        }
      }

    return (
        <div className="contenedortotal">
            <header className="galeriaFotos-header"  ref={headerRef}>
                <h2>{nombreApellido}</h2>
                <strong>PANTONE MERCEDES</strong>
                <button onClick={scrollToGallery} className="geleriaFotos-header-button">VER FOTOS</button>
                {mostrarPostSubida ? <PostSubidaFotos setContenido={setContenido}  contenido={contenido} setMostrarPostSubida={setMostrarPostSubida}></PostSubidaFotos> : null}

        
            </header>
            
                <div className="containerHeaders" ref={galeriaRef}>
                    {cantidadImgSeleccionadas === 0 
                    ? 
                        (
        
                               <GaleriaFotosSeleccionador informacionImgCheckeada={informacionImgCheckeada}/>  
                        )
                        :   
                        (
               
                                 <GaleriaFotosCantidadSelec nombreApellido={nombreApellido} setContenido={setContenido} setMostrarPostSubida={setMostrarPostSubida} informacionImgCheckeada={informacionImgCheckeada}  setCantidadImgSeleccionadas={setCantidadImgSeleccionadas}  setInformacionImgCheckeada={setInformacionImgCheckeada} setIndexImgCheckeada={ setIndexImgCheckeada}   cant={cantidadImgSeleccionadas}/>
                        )

                    }
                </div>
           
             <main className="galeriaFotos-main" > 
                    <div className="galeriaFotos-div" >
                        {
                            imagenes.length > 0 ? (
                                imagenes.map((url, index) => (
                                    <LazyLoadComponent key={index} threshold={200} width={100} height={100}>
                                   
                                    <div key={index} className="galeriaFotos-container-imagen"  onMouseEnter={()=>{setMostrarHoverCheck(index)}} onMouseLeave={()=>{setMostrarHoverCheck(null)}}>
                                    {!isMobile ?
                                    <>
                                        <Check 
                                            onClick={(event) => handleClickImgCheckeada(event, index)} 
                                            className={indexImgCheckeada.includes(index) 
                                            ? 'galeriaFotos-check-clicked' 
                                            : (mostrarHoverCheck === index ? 'galeriaFotos-check' : 'displayNone')
                                            }
                                        />
                                        <img
                                            src={url}
                                            alt="Imagen de cliente"
                                            onClick={() => handleImageClick(url, index)}
                                            className={indexImgCheckeada.includes(index) ? 'galeriaFotos-img-cheackeada' : 'galeriaFotos-img'}
                                            onLoad={handleImageLoad}
                                        />
                                        <ZoomIn className={`${mostrarHoverCheck===index ? 'galeriaFotos-zoom' : 'displayNone'}`} onClick={()=>{handleClickZoom(url, index)}} />    
                                    </>
                                    : 
                                    <>
                                        <Check className={indexImgCheckeada.includes(index) 
                                            ? 'galeriaFotos-check-clicked' 
                                            : (mostrarHoverCheck === index ? 'galeriaFotos-check' : 'displayNone')
                                            } />
                                        <img onTouchStart={(event)=>{handleTouchStart(event, index)}} onClick={(event)=>{onClickMobileImg(event,index)}} onTouchEnd={(event)=>handleTouchEnd(event)}  onTouchMove={handleTouchMove} src={url} alt="Imagen de cliente" className={indexImgCheckeada.includes(index) ? 'galeriaFotos-img-cheackeada' : 'galeriaFotos-img'} />
                                        <ZoomIn className={`${cantidadImgSeleccionadas > 0 ? 'galeriaFotos-zoom' : 'displayNone'}`} onClick={()=>{handleClickZoom(url, index)}}/>
                                    </>
                                    
                                    
                                    
                                    
                                    }
                                    

                                   </div> 
                                   </LazyLoadComponent>
                                   
                                ))
                            ) : (
                                <p>No hay imágenes disponibles</p> 
                            )
                        }
                        
                    </div>
                        
                    {overlayVisible && (
                    
                    <OverlayImagen
                        handleClickImgCheckeada={handleClickImgCheckeada}
                        overlayIndex={overlayIndex}
                        claseCheckOverlay={claseCheckOverlay}
                        setClaseCheckOverlay={setClaseCheckOverlay}
                        indexImgCheckeada={indexImgCheckeada}
                        imagenes = {imagenes}
                        onClose={handleOverlayClose}
                    />
                    
                )}
                
               
            </main>
            <footer className="galeriaFotos-footer">    <button onClick={()=>{headerRef.current.scrollIntoView({ behavior: 'smooth' })}} className="galeriaFotos-main-button">VOLVER ARRIBA</button></footer>
        </div>
    )
}