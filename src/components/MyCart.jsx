import { TbShoppingBagHeart } from "react-icons/tb";
import useOffcanvasStore from "../store/offcanvasStore";
import useCartStore from "../store/cartStore";
import useTotalStore from "../store/totalProductStore";
import useBalanceStore from "../store/balanceStore";

const MyCart = () => {
  const { balanceo } = useBalanceStore();
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const totalProducts = getTotalProducts(cart);
  const { toggleOffcanvas } = useOffcanvasStore();

  const buttonClass = `btn cart-badge position-relative ms-auto me-1 swing-on-hover ${balanceo ? "balanceo" : ""}`;

  return (
    <button 
      type="button" 
      onClick={toggleOffcanvas} 
      className={buttonClass}
      style={{ border: 'none', backgroundColor: 'transparent' }}
    >
      <TbShoppingBagHeart className="shopping-bag-icon" style={{ color: 'var(--cucharaita-principal)', fontSize: '2rem' }} />
      <span 
        className="position-absolute top-0 start-100 translate-middle badge rounded-pill shadow-sm"
        style={{ 
          backgroundColor: 'var(--cucharaita-enfasis)', 
          color: 'var(--cucharaita-principal)', 
          fontSize: '0.8rem',
          border: '2px solid var(--cucharaita-secundario-3)'
        }}
      >
        {totalProducts}
        <span className="visually-hidden">productos en el carrito</span>
      </span>
    </button>
  );
};

export default MyCart;
