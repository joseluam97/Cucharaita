// src/App.jsx

import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useCartStore from "./store/cartStore";
import useOffcanvasStore from "./store/offcanvasStore";
import useTotalStore from "./store/totalProductStore";
import useBalanceStore from "./store/balanceStore";
import logo from "./assets/imgs/logo_reducido.png";

// Componentes
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SidebarOffCanvas from "./components/SidebarOffCanvas";
import Home from "./components/Home";
import Opinions from "./components/Opinions";
import ProductDetail from "./components/ProductDetail";
import OpinionsList from "./components/OpinionsList";
import useStateShop from "./hooks/useStateShop";
import useLogAccess from "./hooks/useAccess";

const App = () => {
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();
  const { data: stateShop } = useStateShop({});

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
    <div className="min-h-screen w-full bg-brand-cream/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-accent rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 flex flex-col items-center text-center bg-brand-white p-10 md:p-16 rounded-[3rem] shadow-2xl border-4 border-brand-white max-w-2xl w-full">

        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-accent/20 text-brand-primary font-bold text-sm mb-6 border border-brand-accent">
          <span className="text-xl">👩‍🍳</span>
          <span>Obrador cerrado temporalmente</span>
        </div>
        <br />

        <div className="w-full max-w-[350px] md:max-w-[400px] mx-auto mb-8 flex justify-center items-center">
          <img
            src={logo}
            alt="Cucharaita Logo"
            className="w-full max-w-full h-auto object-contain drop-shadow-md"
          />
        </div>
        <br />

        <h1 className="font-cooper text-brand-dark text-4xl md:text-5xl leading-tight mb-6">
          Estamos trabajando en algo increíble.
        </h1>

        <p className="text-gray-600 text-lg md:text-xl font-sans mb-10 max-w-lg leading-relaxed">
          <br />
          Nuestra web se está actualizando para ofrecerte una experiencia aún más dulce. <br />
          Volvemos despues de verano.
        </p>

        <div className="flex space-x-2 justify-center items-center">
          <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-brand-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

      </div>
    </div>
  );

  /*if (stateShop != undefined && stateShop.is_maintenance) {
    return (
      <div className="min-h-screen w-full bg-brand-cream/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">

        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-accent rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 flex flex-col items-center text-center bg-brand-white p-10 md:p-16 rounded-[3rem] shadow-2xl border-4 border-brand-white max-w-2xl w-full">

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand-accent/20 text-brand-primary font-bold text-sm mb-6 border border-brand-accent">
            <span className="text-xl">👩‍🍳</span>
            <span>{stateShop.message_maintenance ? stateShop.message_maintenance : "Obrador cerrado temporalmente"}</span>
          </div>
          <br />

          <img
            src={logo}
            alt="Cucharaita Logo"
            className="w-48 md:w-64 mb-8 drop-shadow-md"
          />

          <br />

          <h1 className="font-cooper text-brand-dark text-4xl md:text-5xl leading-tight mb-6">
            {stateShop.title_maintenance ? stateShop.title_maintenance : "Estamos horneando algo increíble."}
          </h1>

          <p className="text-gray-600 text-lg md:text-xl font-sans mb-10 max-w-lg leading-relaxed">
            <br />
            Nuestra web se está actualizando para ofrecerte una experiencia aún más dulce. <br />
            Vuelve pronto para descubrir nuestras nuevas recetas.
          </p>

          <div className="flex space-x-2 justify-center items-center">
            <div className="w-3 h-3 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-brand-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-brand-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

        </div>
      </div>
    );
  }
  else if (stateShop != undefined && !stateShop.is_maintenance) {
    return (
      <>
        <Nav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/opinions/" element={<Opinions />} />
            <Route path="/opinions/:code" element={<Opinions />} />
            <Route path="/opiniones" element={<OpinionsList />} />
            <Route path="*" element={<div className="container mt-5 text-center"><h1>404</h1></div>} />
          </Routes>
        </main>
        {isVisible && <SidebarOffCanvas />}
        <Footer />
      </>
    );
  }*/


};

export default App;