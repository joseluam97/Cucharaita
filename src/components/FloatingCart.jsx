import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TbShoppingBagHeart } from "react-icons/tb";
import useOffcanvasStore from "../store/offcanvasStore";
import useCartStore from "../store/cartStore";
import useTotalStore from "../store/totalProductStore";

const FloatingCart = () => {
  const location = useLocation();

  const { isVisible, toggleOffcanvas } = useOffcanvasStore();
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const totalProducts = getTotalProducts(cart);

  const isSectionAdmin = location.pathname.includes("/administration");

  if (isSectionAdmin) {
    return null;
  }

  if (isVisible) return null;

  return (
    <button
      onClick={toggleOffcanvas}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
      }}
      // He forzado 'text-brand-white' en todo el botón para asegurar el contraste
      className="flex items-center p-[50px] gap-3 px-10 py-4 rounded-full bg-brand-accent text-brand-black hover:text-brand-white shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 hover:scale-105 hover:bg-brand-primary border-2 border-primary hover:border-brand-white"
      aria-label="Abrir carrito"
    >
      <TbShoppingBagHeart className="text-2xl" />

      {/* Texto siempre blanco */}
      <span className="font-extrabold text-lg whitespace-nowrap text-brand-black hover:text-brand-white">Mi Carrito</span>

      {/* Contador con contraste alto, texto siempre blanco */}
      {totalProducts > 0 && (
        <span className="flex items-center justify-center min-w-[28px] h-7 px-2 bg-brand-primary text-brand-white text-sm font-black rounded-full shadow-md border border-white">
          {totalProducts}
        </span>
      )}
    </button>
  );
};

export default FloatingCart;