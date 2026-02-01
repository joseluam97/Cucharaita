// src/App.jsx

import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"; 
import useCartStore from "./store/cartStore";
import useOffcanvasStore from "./store/offcanvasStore";
import useTotalStore from "./store/totalProductStore";
import useBalanceStore from "./store/balanceStore";

// Componentes
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SidebarOffCanvas from "./components/SidebarOffCanvas";
import Home from "./components/Home";
import Opinions from "./components/Opinions";
import ProductDetail from "./components/ProductDetail";

import useLogAccess from "./hooks/useAccess";

const App = () => {
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();

  const { insertAccess } = useLogAccess();
const MODE_WEB = import.meta.env.MODE

  // --- LOG AVANZADO DE USUARIO ---
  useEffect(() => {
    const logUserAccess = async () => {
      try {
        // 1. Datos técnicos avanzados del navegador
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        // 2. Obtener Ubicación e IP (Requiere fetch a API externa)
        // Usamos ipapi.co (gratuita para pocas peticiones)
        const response = await fetch('https://ipapi.co/json/');
        const locationData = await response.json();

        const technicalData = {
          fecha: new Date().toLocaleString(),
          zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
          idioma: navigator.language,
          tipo_conexion: connection ? connection.effectiveType : "Desconocido", // 4g, 3g, wifi...
          es_tactil: navigator.maxTouchPoints > 0 ? "Sí" : "No",
          referrer: document.referrer || "Acceso directo",
          url: window.location.href,
          ip: locationData.ip,
          ciudad: locationData.city,
          region: locationData.region,
          pais: locationData.country_name,
          proveedor_internet: locationData.org,
          codigo_postal: locationData.postal,
          lat_long: `${locationData.latitude}, ${locationData.longitude}`

        };
        
        if(MODE_WEB==="production"){
          await insertAccess(technicalData);
        }

      } catch (error) {
        console.error("No se pudo obtener la ubicación:", error);
      }
    };

    logUserAccess();

  }, []);
  // -------------------------------

  useEffect(() => {
    if (cart.length > 0) {
      const totalProductsBalanceo = getTotalProducts(cart);
      if (!isVisible) toggleOffcanvas(true);
      if (totalProductsBalanceo > 0) toggleBalanceo(true);
    }
  }, [cart, getTotalProducts, toggleBalanceo, toggleOffcanvas]);

  return (
    <>
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/opinions/" element={<Opinions />} />
          <Route path="*" element={<div className="container mt-5 text-center"><h1>404</h1></div>} />
        </Routes>
      </main>
      {isVisible && <SidebarOffCanvas />}
      <Footer />
    </>
  );
};

export default App;