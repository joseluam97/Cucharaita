import React from "react";
import { BsCartPlus, BsBoxSeam, BsSlashCircle } from "react-icons/bs"; 
import useCartStore from "../store/cartStore";
import { useNavigate } from "react-router-dom";
import { Base64 } from 'js-base64';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const isAvailable = product.available; 
  const hasOffer = product.offer_price && Number(product.offer_price) > 0;
  const finalPrice = hasOffer ? Number(product.offer_price) : Number(product.price);

  const handleNavigation = () => {
    if (!isAvailable) return;
    const originalId = String(product.id);
    const encodedId = Base64.encodeURI(originalId);
    navigate(`/product/${encodedId}`);
  };

  const handleButtonAction = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    
    if (product?.has_options) {
      handleNavigation();
    } else {
      const productToAdd = {
        ...product,
        price: finalPrice, 
        selectedOptions: null,
        quantity: 1,
      };
      addToCart(productToAdd);
    }
  };

  return (
    <div className="w-full h-full text-brand-dark no-underline">
      {/* Contenedor principal con relleno (p-2) para crear un marco alrededor de la imagen */}
      <div className={`flex flex-col h-full rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-brand-cream/50 p-2 md:p-3 ${isAvailable ? 'bg-brand-white' : 'bg-gray-50'}`}>
        
        <div 
          className={`flex-grow flex flex-col ${isAvailable ? 'cursor-pointer' : ''}`} 
          onClick={handleNavigation}
        >
          {/* MARCO DE LA IMAGEN: Proporción 1:1 estricta, borde y esquinas muy redondeadas */}
          <div className="relative w-full aspect-square rounded-[1.5rem] overflow-hidden shadow-sm border-[3px] border-brand-cream/30">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${!isAvailable ? 'opacity-50 grayscale' : 'opacity-100'}`}
            />

            {/* Capa de producto agotado */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-brand-cream/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-brand-primary text-brand-white shadow-lg px-3 md:px-4 py-1.5 md:py-2 uppercase font-bold tracking-widest rounded-full text-xs md:text-sm">
                  Agotado
                </span>
              </div>
            )}

            {/* Etiquetas Superiores */}
            {isAvailable && hasOffer && (
               <span className="absolute top-2 right-2 z-10 text-[0.65rem] md:text-xs bg-brand-accent text-brand-primary font-extrabold px-2 py-1 rounded-full border border-brand-primary shadow-sm">
                 ¡OFERTA!
               </span>
            )}

            {isAvailable && product.tag?.title && (
              <span 
                className="absolute top-2 left-2 z-10 text-brand-white text-[0.65rem] md:text-xs font-bold capitalize px-2 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: product.tag.color || "var(--color-brand-secondary)" }}
              >
                {product.tag.title}
              </span>
            )}

            {/* Etiqueta de Categoría Flotante Abajo */}
            <span className="absolute bottom-2 left-2 z-10 bg-brand-white/90 text-brand-primary font-bold text-[0.65rem] md:text-xs px-2 md:px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
              {product.type.name}
            </span>
          </div>

          {/* Textos y Precios */}
          <div className="flex flex-col pt-3 px-1 md:px-2 flex-grow">
            <h5 className={`font-bold text-sm md:text-base mb-1 line-clamp-2 leading-tight ${!isAvailable ? 'text-gray-400' : 'text-brand-dark'}`}>
                {product.name}
            </h5>

            <div className="mt-auto pt-1 flex items-center flex-wrap gap-2">
              {hasOffer && isAvailable ? (
                  <>
                      <span className="font-extrabold text-base md:text-lg text-brand-primary">
                          {finalPrice.toFixed(2)} €
                      </span>
                      <span className="text-gray-400 line-through text-xs">
                          {Number(product.price).toFixed(2)} €
                      </span>
                  </>
              ) : (
                  <p className={`mb-0 font-extrabold text-base md:text-lg ${!isAvailable ? 'text-gray-400 line-through' : 'text-brand-primary'}`}>
                    {Number(product.price).toFixed(2)} €
                  </p>
              )}
            </div>
          </div>
        </div>

        {/* Zona del Botón: Ahora es rounded-full */}
        <div className="bg-transparent border-none mt-3 px-1 md:px-2 pb-1">
          <button
            disabled={!isAvailable} 
            className={`w-full flex items-center justify-center gap-2 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all duration-200 
              ${!isAvailable 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                : product?.has_options 
                  ? 'bg-brand-cream text-brand-primary border border-brand-primary hover:bg-brand-primary hover:text-brand-white shadow-sm' 
                  : 'bg-brand-primary text-brand-white hover:bg-brand-secondary shadow-md hover:shadow-lg'
              }`}
            onClick={handleButtonAction}
          >
            {!isAvailable ? (
                <><span>Agotado</span><BsSlashCircle className="text-base" /></>
            ) : product?.has_options ? (
              <><span>Opciones</span><BsBoxSeam className="text-base" /></>
            ) : (
              <><span>Añadir</span><BsCartPlus className="text-base text-brand-white md:text-lg" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;