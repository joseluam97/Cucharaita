// components/ProductCard.jsx

import React from "react";
import { BsCartPlus, BsBoxSeam } from "react-icons/bs";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import { Base64 } from 'js-base64';

const ProductCard = ({ product }) => {
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

        {/* AREA DE NAVEGACIÓN */}
        <div
          className="cursor-pointer flex-grow-1"
          onClick={handleNavigation}
        >
          <div className="position-relative">
            {/* 🛑 CAMBIO CLAVE: Contenedor con altura fija y object-fit */}
            <img
              src={product.image}
              className="card-img-top"
              alt={product.name}
              style={{ 
                height: "250px",      // Altura fija para uniformidad
                objectFit: "cover",   // Recorta la imagen para llenar el espacio sin deformarse
                width: "100%"         // Asegura que ocupe todo el ancho
              }}
            />
            <span className="badge custom-badge position-absolute top-0 end-0 m-2">
              {product.type.name}
            </span>
          </div>

          <div className="card-body d-flex flex-column pb-2">
            <h5 className="card-title mb-2" style={{ fontSize: "1.1rem" }}>
                {product.name}
            </h5>

            <div className="mt-auto pt-3">
              <p className="mb-0 fs-5">
                <strong>Precio:</strong> {product.price} €
              </p>
            </div>
          </div>
        </div>

        {/* BOTÓN DE ACCIÓN */}
        <div className="card-footer bg-white border-0 pt-0 pb-3 px-3">
          <button
            className={`btn w-100 ${product?.has_options ? 'btn-outline-dark' : 'btn-cart'}`}
            onClick={handleButtonAction}
          >
            {product?.has_options ? (
              <>Seleccionar opciones &nbsp; <BsBoxSeam /></>
            ) : (
              <>Agregar al carrito &nbsp; <BsCartPlus /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;