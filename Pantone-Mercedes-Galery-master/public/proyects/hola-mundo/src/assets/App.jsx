import "./Estilos/App.css";
import { PantoneWebHeader } from "./Componentes/PantoneWeb-header";
import { PantoneWebMain } from "./Componentes/PantoneWebMain";
import { BrowserRouter, Route, Routes, Navigate  } from "react-router-dom";
import { GaleriaFotos } from "./Componentes/GaleriaFotos";
import { useState, useEffect } from "react";
import { Login } from "./Componentes/Login";

export function App() {

    useEffect(() => {
    if (/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|webOS/i.test(navigator.userAgent)) {
      document.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Previene el menú contextual
      });
    }
  }, []);

  const [acceso, setAcceso] = useState(false);
  const [actualizarApp, setActualizarApp] = useState(false);

  useEffect(() => {
    const accesoGuardado = localStorage.getItem("acceso");
    if (accesoGuardado === "11134") {
      setAcceso(true);

    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <section className="app-login">
              <Login setAcceso={setAcceso} />
            </section>
          }
        />
       <Route
          path="/inicio"
          element={
            acceso ? (
              <section className="app-section">
                <PantoneWebHeader />
                <PantoneWebMain setActualizarApp={setActualizarApp} actualizarApp={actualizarApp} />
              </section>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/cliente/:id/:nombre/:apellido"
          element={<GaleriaFotos />}
        />
      </Routes>
    </BrowserRouter>
  );
}
