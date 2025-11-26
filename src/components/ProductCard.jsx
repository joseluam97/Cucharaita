import React, { useState } from "react";
import { BsCartPlus } from "react-icons/bs";
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState(
    product?.options?.length > 0 ? product.options[0] : null
  );

  // FUNCIÓN DE NAVEGACIÓN
  // Esta función solo se llamará cuando se haga clic en el contenido que NO es el botón.
  const handleNavigation = () => {
    navigate(`/product/${product.id}`);
  };

  // FUNCIÓN DEL BOTÓN DE CARRITO
  // Aquí ya no necesitamos e.stopPropagation() si el botón está fuera del área de navegación.
  // Aunque lo mantendremos como buena práctica por si acaso.
  const handleAddToCart = (e) => {
    // Detiene la propagación por si hay un elemento padre (como el <div col>) que escucha clics.
    //e.stopPropagation(); 

    if (product.options && !selectedOption) {
      alert("Por favor, selecciona una opción antes de agregar al carrito.");
      return;
    }

    const productToAdd = {
      ...product,
      selectedOption: selectedOption,
      quantity: 1,
    };
    addToCart(productToAdd);
  };

  return (
    // 1. EL CONTENEDOR PRINCIPAL <div col> NO ES CLIQUEABLE.
    <div className="text-decoration-none text-dark h-100">
      <div className="card custom-card h-100 d-flex flex-column">

        {/* 2. AREA DE NAVEGACIÓN: Todo esto es cliqueable */}
        <div
          className="cursor-pointer flex-grow-1" // Hace que el contenido crezca y sea cliqueable
          onClick={handleNavigation} // 👈 Este div activa la navegación
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

          <div className="card-body pb-2"> {/* Reducimos el padding inferior para el botón */}
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
                        ? "btn-dark"
                        : "btn-outline-dark"
                        }`}
                      onClick={(e) => {
                        // 🛑 CRUCIAL: Detiene la propagación para que NO navegue la tarjeta
                        e.stopPropagation();
                        setSelectedOption(option);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Sección de Precio */}
            <div className="d-flex justify-content-between align-items-center pt-3">
              <p className="mb-0 fs-5">
                <strong>Precio:</strong> {product.price} €
              </p>
            </div>
          </div>
        </div> {/* 👈 FIN DEL AREA DE NAVEGACIÓN */}

        {/* 3. BOTÓN DE CARRITO AISLADO: Se coloca en un div separado, fuera del área de navegación */}
        <div className="card-footer bg-white border-0 pt-0 pb-3 px-3">
          <button
            className="btn btn-cart w-100"
            onClick={handleAddToCart}
            disabled={product.options && !selectedOption}
          >
            Agregar al carrito &nbsp; <BsCartPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;