import "./Estilos/App.css";
import { PantoneWebHeader } from "./Componentes/PantoneWeb-header";
import { PantoneWebMain } from "./Componentes/PantoneWebMain";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { GaleriaFotos } from "./Componentes/GaleriaFotos";
import {useState} from "react";
export function App(){

    if(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|webOS/i.test(navigator.userAgent)){
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Previene el menú contextual
          });
    }



    const [actualizarApp, setActualizarApp] = useState(false);
    return (
        <BrowserRouter>
             <Routes>
                <Route path="/"
                    element={
                    <section className="app-section">
                        <PantoneWebHeader></PantoneWebHeader>
                        <PantoneWebMain setActualizarApp={setActualizarApp} actualizarApp={actualizarApp}></PantoneWebMain>
                    </section>
                    }
                > 
                </Route>
                <Route path="/cliente/:id/:nombre/:apellido"
                    element={
                        <GaleriaFotos></GaleriaFotos>
                    }
                >

                </Route>
                </Routes>
            
        </BrowserRouter>
    )
}

