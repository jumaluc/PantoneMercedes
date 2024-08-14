import "../Estilos/OverlayImagen.css";
import {ChevronLeft} from "./LeftArrow.jsx";
import {ChevronRight} from "./RightArrow.jsx";
import { ArrowLeft } from "./ArroyLeft.jsx";
import { useState, useEffect } from "react";
import React, { useRef } from 'react';
import { Check } from "./Check.jsx";
export function OverlayImagen({onClose, imagenes,  overlayIndex, handleClickImgCheckeada, claseCheckOverlay, setClaseCheckOverlay, indexImgCheckeada}){

    const [index, setIndex] = useState(overlayIndex);
    const [imagenActual , setImagenActual] =  useState(imagenes[index]);
    const [cargando, setCargando] = useState(true); 
    const [imgLoaded, setImgLoaded] = useState(false);
    useEffect(() => {

        if(indexImgCheckeada.includes(index)){
            setClaseCheckOverlay("overlay-check-clicked");
        }
        else{
            setClaseCheckOverlay(" ");
        }
        setCargando(true); 
        setImgLoaded(false); 
        setImagenActual(imagenes[index]);

    },[index])

    const handleClickImg = (event) => {
        event.stopPropagation();

    }

    const handleClickImgDiv = (event) => {
        event.stopPropagation();
        setCargando(true);
        const posX = event.clientX;
        const halfScreenWidth = window.innerWidth / 2;
        let newIndex;

        if (posX < halfScreenWidth) {
            newIndex = index === 0 ? imagenes.length - 1 : index - 1;

        } else {
            newIndex = index === imagenes.length - 1 ? 0 : index + 1;

        }

        setIndex(newIndex);
    };

    const handleOnloadImg = () => {
        setCargando(false); 
        setImgLoaded(true); 
    }
    return (
        <div className="overlay" onClick={handleClickImgDiv}>
            <Check onClick={(event)=>{handleClickImgCheckeada(event,index)}}   className={`overlay-check ${claseCheckOverlay}`}/> 
            <ArrowLeft className="overlay-comeBack" onClick={onClose}/>
            <ChevronLeft className="overlay-arrowleft"/>
            {cargando && <div className="circulo-carga"></div>  } 
            <img src={imagenActual} alt="Imagen grande" className={`overlay-img ${imgLoaded ? "visible" : ""}`} onLoad={handleOnloadImg} onClick={handleClickImg} />
            <ChevronRight className="overlay-arrowright" />
        </div>
    );
}
