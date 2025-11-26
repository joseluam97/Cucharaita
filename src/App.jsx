// src/App.jsx

import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"; // 👈 Importar para la gestión de rutas
import useCartStore from "./store/cartStore";
import useOffcanvasStore from "./store/offcanvasStore";
import useTotalStore from "./store/totalProductStore";
import useBalanceStore from "./store/balanceStore";

// Componentes del layout
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import SidebarOffCanvas from "./components/SidebarOffCanvas";

// Vistas/Páginas
import Home from "./components/Home"; // 👈 Importar la nueva vista Home
import ProductDetail from "./components/ProductDetail"; // 👈 Asumimos que tienes el detalle

const App = () => {
  // Solo se quedan los stores necesarios para el LAYOUT y el OFFcanvas
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();

  // UseEffect para manejar el estado de balanceo y el Offcanvas
  useEffect(() => {
    // Si hay productos en el carrito, activa la animación de balanceo y abre el Offcanvas
    if (cart.length > 0) {
      const totalProductsBalanceo = getTotalProducts(cart);
      
      if (!isVisible) {
        toggleOffcanvas(true);
      }

      if (totalProductsBalanceo > 0) {
        toggleBalanceo(true);
      }
    }
    // No necesitamos el temporizador de carga simulada aquí,
    // ese temporizador ahora está en el componente Home.

  }, [cart, getTotalProducts, toggleBalanceo, toggleOffcanvas]);


  return (
    <>
      <Nav />
      
      <main>
        <Routes>
          {/* Ruta principal (Home) */}
          <Route path="/" element={<Home />} /> 
          
          {/* Ruta para el detalle del producto */}
          <Route path="/product/:id" element={<ProductDetail />} />
          
          {/* Opcional: Ruta 404 */}
          <Route path="*" element={
              <div className="container mt-5 text-center">
                  <h1>404</h1>
                  <p>Página no encontrada.</p>
              </div>
          } />
        </Routes>
      </main>

      {/* El Sidebar Offcanvas se gestiona desde App */}
      {isVisible && <SidebarOffCanvas />}

      <Footer />
    </>
  );
};

export default App;