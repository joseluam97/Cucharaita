// components/ProductCard.jsx

import React from "react";
import { BsCartPlus, BsBoxSeam } from "react-icons/bs";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import { Base64 } from 'js-base64';

const ProductCard = ({ product }) => {
  // Detectar móvil para ajustes finos de UI
  const isMobile = window.innerWidth < 768;

  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleNavigation = () => {
    const originalId = String(product.id);
    const encodedId = Base64.encodeURI(originalId);
    navigate(`/product/${encodedId}`);
  };

  const handleButtonAction = (e) => {
    if (product?.has_options) {
      handleNavigation();
    } else {
      const productToAdd = {
        ...product,
        selectedOptions: null,
        quantity: 1,
      };
      addToCart(productToAdd);
    }
  };

  return (
    <div className="text-decoration-none text-dark h-100">
      <div className="card custom-card h-100 d-flex flex-column shadow-sm">
        <div className="cursor-pointer flex-grow-1" onClick={handleNavigation}>
          <div className="position-relative">
            <img
              src={product.image}
              className="card-img-top"
              alt={product.name}
              style={{ 
                height: isMobile ? "150px" : "250px", 
                objectFit: "cover",
                width: "100%"
              }}
            />
            <span className="badge custom-badge position-absolute top-0 end-0 m-2">
              {product.type.name}
            </span>
          </div>

          <div className="card-body d-flex flex-column p-2">
            <h5 className="card-title mb-1" style={{ fontSize: isMobile ? "0.9rem" : "1.1rem" }}>
                {product.name}
            </h5>

            <div className="mt-auto pt-2">
              <p className="mb-0 fw-bold" style={{ fontSize: isMobile ? "0.85rem" : "1.1rem" }}>
                {product.price} €
              </p>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white border-0 pt-0 pb-3 px-1">
          <button
            className={`btn w-100 btn-sm d-flex align-items-center justify-content-center gap-1 ${product?.has_options ? 'btn-outline-dark' : 'btn-cart'}`}
            onClick={handleButtonAction}
            style={{ 
              fontSize: isMobile ? "0.68rem" : "0.85rem", // Fuente un poco más pequeña en móvil para que quepa el texto
              paddingLeft: "2px",
              paddingRight: "2px"
            }}
          >
            {product?.has_options ? (
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