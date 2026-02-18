import React from "react";
import { BsCartPlus, BsBoxSeam, BsSlashCircle } from "react-icons/bs"; 
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import { Base64 } from 'js-base64';

const ProductCard = ({ product }) => {
  const isMobile = window.innerWidth < 768;
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  // 1. Verificamos disponibilidad
  const isAvailable = product.available; 
  
  // 2. 🛑 Verificamos si hay OFERTA
  // Si offer_price existe y es mayor a 0, hay oferta.
  const hasOffer = product.offer_price && Number(product.offer_price) > 0;
  
  // Definimos el precio final a mostrar/usar
  const finalPrice = hasOffer ? Number(product.offer_price) : Number(product.price);

  const handleNavigation = () => {
    if (!isAvailable) return;
    const originalId = String(product.id);
    const encodedId = Base64.encodeURI(originalId);
    navigate(`/product/${encodedId}`);
  };

  const handleButtonAction = (e) => {
    if (!isAvailable) return;
    
    if (product?.has_options) {
      handleNavigation();
    } else {
      const productToAdd = {
        ...product,
        price: finalPrice, // 🛑 Añadimos al carrito con el precio de oferta si existe
        selectedOptions: null,
        quantity: 1,
      };
      addToCart(productToAdd);
    }
  };

  return (
    <div className="text-decoration-none text-dark h-100">
      <div className={`card custom-card h-100 d-flex flex-column shadow-sm ${!isAvailable ? 'bg-light' : ''}`}>
        
        <div 
          className={`flex-grow-1 ${isAvailable ? 'cursor-pointer' : ''}`} 
          onClick={handleNavigation}
        >
          <div className="position-relative">
            <img
              src={product.image}
              className="card-img-top"
              alt={product.name}
              style={{ 
                height: isMobile ? "150px" : "250px", 
                objectFit: "cover",
                width: "100%",
                opacity: isAvailable ? 1 : 0.6,
                filter: isAvailable ? 'none' : 'grayscale(100%)' 
              }}
            />

            {/* Letrero NO DISPONIBLE */}
            {!isAvailable && (
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", zIndex: 20 }}
              >
                <span className="badge bg-danger fs-6 shadow px-3 py-2 text-uppercase">
                  No disponible
                </span>
              </div>
            )}

            {/* 🛑 BADGE DE OFERTA (Si hay oferta y está disponible) */}
            {isAvailable && hasOffer && (
               <span 
                 className="position-absolute top-0 end-0 m-1 badge shadow bg-danger"
                 style={{ zIndex: 15, fontSize: "0.8rem" }}
               >
                 ¡OFERTA!
               </span>
            )}

            {/* ETIQUETA DESTACADA (Tag) */}
            {isAvailable && product.tag?.title && (
              <span 
                className="position-absolute top-0 start-0 m-1 badge shadow"
                style={{ 
                  backgroundColor: product.tag.color || "#000",
                  color: "#fff",
                  fontSize: isMobile ? "0.7rem" : "0.90rem",
                  fontWeight: "700",
                  textTransform: "capitalize",
                  zIndex: 10,
                  borderRadius: "5px"
                }}
              >
                {product.tag.title}
              </span>
            )}

            {/* Badge de Categoría (Movido un poco si hay oferta para que no se solapen) */}
            <span 
                className="badge custom-badge position-absolute top-0 end-0" 
                style={{ zIndex: 14, marginTop: hasOffer ? '25px' : '0' }} // Pequeño ajuste si hay oferta
            >
              {product.type.name}
            </span>
          </div>

          <div className="card-body d-flex flex-column p-2">
            <h5 className={`card-title mb-1 ${!isAvailable ? 'text-muted' : ''}`} style={{ fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                {product.name}
            </h5>

            <div className="mt-auto pt-2">
              {/* 🛑 LOGICA DE PRECIOS VISUAL */}
              {hasOffer && isAvailable ? (
                  <div>
                      <span className="text-danger fw-bold me-2" style={{ fontSize: isMobile ? "0.9rem" : "1.15rem" }}>
                          {finalPrice.toFixed(2)} €
                      </span>
                      <span className="text-muted text-decoration-line-through small">
                          {Number(product.price).toFixed(2)} €
                      </span>
                  </div>
              ) : (
                  <p className={`mb-0 fw-bold ${!isAvailable ? 'text-muted text-decoration-line-through' : ''}`} style={{ fontSize: isMobile ? "0.85rem" : "1.1rem" }}>
                    {Number(product.price).toFixed(2)} €
                  </p>
              )}
            </div>
          </div>
        </div>

        <div className="card-footer bg-transparent border-0 pt-0 pb-3 px-1">
          <button
            disabled={!isAvailable} 
            className={`btn w-100 btn-sm d-flex align-items-center justify-content-center gap-1 ${
                !isAvailable 
                ? 'btn-secondary' 
                : (product?.has_options ? 'btn-outline-dark' : 'btn-cart')
            }`}
            onClick={handleButtonAction}
            style={{ 
              fontSize: isMobile ? "0.68rem" : "0.85rem", 
              paddingLeft: "2px",
              paddingRight: "2px",
              cursor: !isAvailable ? 'not-allowed' : 'pointer'
            }}
          >
            {!isAvailable ? (
                <>
                  <span>Agotado</span>
                  <BsSlashCircle size={isMobile ? 12 : 16} />
                </>
            ) : product?.has_options ? (
              <>
                <span>Seleccionar opciones</span> 
                <BsBoxSeam size={isMobile ? 12 : 16} />
              </>
            ) : (
              <>
                <span>Agregar al carrito</span> 
                <BsCartPlus size={isMobile ? 14 : 18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;