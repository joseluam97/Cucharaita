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
  const MODE_WEB = import.meta.env.MODE;

  // --- LOG AVANZADO DE USUARIO ---
  useEffect(() => {
    const logUserAccess = async () => {
      try {
        // 1. Datos técnicos avanzados del navegador
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        // 2. Obtener Ubicación e IP
        // CAMBIO: Usamos geojs.io porque es la más permisiva con CORS y no requiere API Key
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        
        if (!response.ok) throw new Error("Error conectando con API de GeoJS");

        const locationData = await response.json();

        const technicalData = {
          fecha: new Date().toLocaleString(),
          zona_horaria: Intl.DateTimeFormat().resolvedOptions().timeZone,
          idioma: navigator.language,
          tipo_conexion: connection ? connection.effectiveType : "Desconocido", 
          es_tactil: navigator.maxTouchPoints > 0 ? "Sí" : "No",
          referrer: document.referrer || "Acceso directo",
          url: window.location.href,
          
          // --- NUEVOS CAMPOS (Adaptados a GeoJS) ---
          ip: locationData.ip || "Desconocida",
          ciudad: locationData.city || "Desconocida",
          region: locationData.region || "Desconocida",
          pais: locationData.country || "Desconocido", 
          proveedor_internet: locationData.organization_name || "Desconocido", // GeoJS suele dar el ISP aquí
          codigo_postal: "No disponible en GeoJS", // GeoJS prioriza velocidad y no suele dar CP exacto
          lat_long: locationData.latitude && locationData.longitude 
                    ? `${locationData.latitude}, ${locationData.longitude}` 
                    : "Desconocido"
        };
        
        // En desarrollo mostramos el log para verificar que funciona
        if (MODE_WEB === "development") {
            console.log("✅ Datos obtenidos (GeoJS):", technicalData);
        }

        if (MODE_WEB === "production") {
          await insertAccess(technicalData);
        }

      } catch (error) {
        console.error("Error en el log de acceso:", error);
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
          <Route path="/opinions/:code" element={<Opinions />} />
          <Route path="*" element={<div className="container mt-5 text-center"><h1>404</h1></div>} />
        </Routes>
      </main>
      {isVisible && <SidebarOffCanvas />}
      <Footer />
    </>
  );
};

export default App;