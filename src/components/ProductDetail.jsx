// components/ProductDetail.jsx

import React, { useState } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsCartPlus } from "react-icons/bs";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCartStore();
    
    const [selectedOption, setSelectedOption] = useState(null);
    const [quantity, setQuantity] = useState(1);

    // 1. LLAMADA AL HOOK AL INICIO DEL COMPONENTE
    const productId = parseInt(id);
    const {
        data: product,
        loading,
        error
    } = useProducts({ id: productId });

    // 2. Manejo de Cantidad
    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    // 3. Renderizado Condicional: Loading, Error, No Data
    if (loading) {
        return <div className="container my-5 text-center">Cargando detalles del producto...</div>;
    }

    if (error || !product) {
        console.error("Error o Producto no encontrado:", error);
        navigate('/', { replace: true });
        return null;
    }

    // 4. Manejador de Agregar al Carrito
    const handleAddToCart = (e) => {
        e.stopPropagation();

        if (product.options && !selectedOption) {
            alert("Por favor, selecciona una opción antes de agregar al carrito.");
            return;
        }
        
        if (quantity < 1) {
            alert("La cantidad debe ser al menos 1.");
            return;
        }

        const productToAdd = {
            ...product,
            selectedOption: selectedOption,
            quantity: quantity,
        };
        
        addToCart(productToAdd);
    };

    return (
        <div className="container my-5">
            
            {/* ⬅️ BREADCRUMB ACTUALIZADO (Centrado y con Fondo) */}
            <div 
                className="mb-4 p-2 rounded shadow-sm d-flex justify-content-center" // Clases para padding, borde y centrado
                style={{ backgroundColor: '#c7d088' }} // 👈 Color de fondo
            >
                <div className="small">
                    {/* Enlace a Productos (Home) */}
                    <Link to="/" className="text-decoration-none text-dark fw-bold">Productos</Link>
                    <span className="text-dark">{' > '}</span>
                    {/* Enlace al Tipo */}
                    <Link to="/" className="text-decoration-none text-dark fw-bold">
                        {product.type?.name || 'Tipo'}
                    </Link>
                    <span className="text-dark">{' > '}</span>
                    {/* Nombre del Producto Actual */}
                    <span className="text-dark">{product.name}</span>
                </div>
            </div>
            
            <div className="row">
                {/* Columna de Imagen */}
                <div className="col-md-6">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="img-fluid rounded shadow"
                    />
                </div>

                {/* Columna de Detalles */}
                <div className="col-md-6">
                    <span className="badge bg-secondary mb-3">{product.type?.name}</span>
                    <h1>{product.name}</h1>
                    <p className="lead">{product.description}</p>

                    <h2 className="text mt-4 mb-3">{product.price} €</h2>

                    {/* Opciones */}
                    {product.options && product.options.length > 0 && (
                        <div className="mt-4">
                            <div className="mb-3">
                                <p className="mb-2">
                                    <strong>Opciones:</strong>
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                    {product.options.map((option, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`btn btn-sm ${option === selectedOption ? "btn-dark" : "btn-outline-dark"}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedOption(option);
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* SELECTOR DE CANTIDAD */}
                    <div className="d-flex align-items-center mb-4 mt-4">
                        <button 
                            className="btn btn-outline-dark" 
                            onClick={decreaseQuantity} 
                            disabled={quantity <= 1}
                        >
                            -
                        </button>
                        <span className="mx-3 fs-5" style={{ minWidth: '30px', textAlign: 'center' }}>{quantity}</span>
                        <button 
                            className="btn btn-outline-dark" 
                            onClick={increaseQuantity}
                        >
                            +
                        </button>
                    </div>

                    <button
                        className="btn btn-dark btn-lg w-100 mt-3"
                        onClick={handleAddToCart}
                        disabled={product.options && !selectedOption}
                    >
                        Agregar al carrito ({quantity}) &nbsp; <BsCartPlus />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;