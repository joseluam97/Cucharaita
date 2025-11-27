// components/ProductCard.jsx

import React, { useState } from "react";
import { BsCartPlus } from "react-icons/bs";
import { BsBoxSeam } from "react-icons/bs"; // Nuevo ícono para "Seleccionar Opciones"
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import { Base64 } from 'js-base64';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  // FUNCIÓN DE NAVEGACIÓN
  const handleNavigation = () => {
    // 1. Convertir el ID numérico a string.
    const originalId = String(product.id);
    // 2. CODIFICAR el ID usando Base64.
    const encodedId = Base64.encodeURI(originalId);
    navigate(`/product/${encodedId}`);
  };

  // FUNCIÓN DEL BOTÓN PRINCIPAL
  const handleButtonAction = (e) => {
    // Si tiene opciones, la acción del botón es NAVIGAR a la página de detalle.
    if (product?.has_options) {
      handleNavigation();
    } else {
      // Si NO tiene opciones, la acción es AGREGAR al carrito.

      // El producto que se añade es el producto base con cantidad 1.
      const productToAdd = {
        ...product,
        selectedOptions: null, // Asegurar que no se envían opciones viejas
        quantity: 1,
      };
      addToCart(productToAdd);
    }
  };

  return (
    <div className="text-decoration-none text-dark h-100">
      <div className="card custom-card h-100 d-flex flex-column">

        {/* AREA DE NAVEGACIÓN: Redirige a detalle */}
        <div
          className="cursor-pointer flex-grow-1"
          onClick={handleNavigation} // 👈 Este div activa la navegación SIEMPRE
        >
          <div className="position-relative">
            <img
              src={product.image}
              className="card-img-top"
              alt={product.name}
            />
            <span className="badge custom-badge position-absolute top-0 end-0">
              {product.type.name}
            </span>
          </div>

          <div className="card-body pb-2">
            <h5 className="card-title mb-4">{product.name}</h5>

            {/* 🛑 SECCIÓN DE OPCIONES ELIMINADA */}

            {/* Sección de Precio (Ajustada) */}
            <div className="d-flex justify-content-between align-items-center pt-3">
              <p className="mb-0 fs-5">
                <strong>Precio:</strong> {product.price} €
              </p>
            </div>
          </div>
        </div> {/* FIN DEL AREA DE NAVEGACIÓN */}

        {/* BOTÓN DE ACCIÓN: Añadir o Navegar */}
        <div className="card-footer bg-white border-0 pt-0 pb-3 px-3">
          <button
            className={`btn w-100 ${product?.has_options ? 'btn-outline-dark' : 'btn-cart'}`}
            onClick={handleButtonAction}
          >
            {product?.has_options ? (
              <>Seleccionar opciones del producto &nbsp; <BsBoxSeam /></> // 🛑 Texto para productos con opciones
            ) : (
              <>Agregar al carrito &nbsp; <BsCartPlus /></> // 🛑 Texto para productos simples
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;