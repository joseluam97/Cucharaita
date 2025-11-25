import React, { useState } from "react";
import { BsCartPlus } from "react-icons/bs";
import useCartStore from "../store/cartStore";

// Componente para una sola tarjeta de producto
const ProductCard = ({ product }) => {
  // Usa el store directamente para acceder a addToCart
  const { addToCart } = useCartStore();

  // Estado para manejar la opción seleccionada (inicialmente la primera o null)
  const [selectedOption, setSelectedOption] = useState(
    product?.options?.length > 0 ? product.options[0] : null
  );

  // Función para agregar al carrito incluyendo la opción
  const handleAddToCart = () => {
    // Solo agrega si hay opciones O si no hay opciones requeridas
    if (product.options && !selectedOption) {
      alert("Por favor, selecciona una opción antes de agregar al carrito.");
      return;
    }

    // Crear un objeto de producto con la opción seleccionada
    const productToAdd = {
      ...product,
      selectedOption: selectedOption // Añade la opción seleccionada
    };

    console.log("productToAdd");
    console.log(productToAdd);

    addToCart(productToAdd);
  };

  return (
    <div className="card custom-card h-100">
      <div className="position-relative">
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
        />
        <span className="badge custom-badge position-absolute top-0 end-0">
          {product.type}
        </span>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-4">{product.name}</h5>

        {/* Sección de Opciones Mejorada */}
        {product?.options && product.options.length > 0 ? (
          <div className="mb-3">
            <p className="mb-2">
              <strong>Opciones:</strong>
            </p>
            <div className="d-flex flex-wrap gap-2">
              {product.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className={`btn btn-sm ${option === selectedOption
                    ? "btn-dark" // Opción seleccionada
                    : "btn-outline-dark" // Opción no seleccionada
                    }`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Sección de Precio y Botón de Carrito */}
        <div className="d-flex justify-content-between align-items-center pt-3">
          <p className="mb-0 fs-5">
            <strong>Precio:</strong> €{product.price}
          </p>
        </div>

        <button
          className="btn btn-cart w-100 mt-3" // Margen superior añadido
          onClick={handleAddToCart}
          // Deshabilita si hay opciones pero ninguna seleccionada
          disabled={product.options && !selectedOption}
        >
          Agregar al carrito &nbsp; <BsCartPlus />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;