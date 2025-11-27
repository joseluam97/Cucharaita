// components/ProductDetail.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsCartPlus } from "react-icons/bs";
import { Base64 } from 'js-base64';

const ProductDetail = () => {
    // Hooks de React Router y Store
    const { id: encodedId } = useParams(); // ID codificado de la URL
    const navigate = useNavigate();
    const { addToCart } = useCartStore();

    // Estados
    const [selectedOption, setSelectedOption] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [productId, setProductId] = useState('-1');
    const [isValidId, setIsValidId] = useState(true); // Estado para manejar ID inválido

    // 1. Método para la decodificación y validación del ID
    const decodeAndValidateId = useCallback(() => {
        let currentProductId = null;

        try {
            // Decodificar
            const decodedId = Base64.decode(encodedId);
            currentProductId = parseInt(decodedId, 10);

            // Validar
            if (isNaN(currentProductId) || currentProductId <= 0) {
                throw new Error("ID decodificado no es válido.");
            }

            // Si es válido, actualiza el estado (lo que disparará la búsqueda del Hook)
            setProductId(currentProductId);
            setIsValidId(true);

        } catch (error) {
            console.error("Error al decodificar/validar el ID:", error);
            setIsValidId(false); // Marcar como ID inválido
            setProductId(null);
        }
    }, [encodedId]);


    // 2. useEffect para ejecutar la decodificación al montar el componente
    useEffect(() => {
        console.log("Decodificando y validando ID");
        decodeAndValidateId();
    }, [decodeAndValidateId]); // Ejecutar solo cuando el componente se monta o el ID codificado cambia


    // 3. useEffect para manejar la redirección si el ID es inválido
    useEffect(() => {
        console.log("isValidId cambió a:", isValidId);
        if (isValidId === false) {
            // Si el ID es inválido, esperamos 3 segundos y redirigimos
            const timer = setTimeout(() => {
                navigate('/', { replace: true });
            }, 3000); // 3000 milisegundos = 3 segundos

            // Limpieza: importante para detener el temporizador si el componente se desmonta antes
            return () => clearTimeout(timer);
        }
    }, [isValidId, navigate]);

    // 4. Llamada al Hook useProducts (solo se ejecuta si productId está establecido)
    const {
        data: product,
        loading,
        error
    } = useProducts({ id: productId });


    // 5. Métodos de Cantidad (refactorizados a funciones claras)
    const increaseQuantity = useCallback(() => setQuantity(prev => prev + 1), []);
    const decreaseQuantity = useCallback(() => setQuantity(prev => Math.max(1, prev - 1)), []);


    // 6. Manejador de Agregar al Carrito (refactorizado a función clara)
    const handleAddToCart = useCallback((e) => {
        // Detener la propagación si se desea, aunque en un botón independiente no es crítico
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
    }, [product, selectedOption, quantity, addToCart]);


    // 7. Renderizado Condicional: ID Inválido
    if (isValidId === false) {
        return (
            <div className="container my-5 text-center">
                <h1 className="text-danger">❌ Error de Enlace</h1>
                <p className="lead">Enlace de producto inválido. Serás redirigido a la página de inicio en 3 segundos...</p>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Redirigiendo...</span>
                </div>
            </div>
        );
    }

    // 8. Renderizado Condicional: Carga de datos
    if (loading || !productId) {
        return <div className="container my-5 text-center">Cargando detalles del producto...</div>;
    }

    // 9. Renderizado Condicional: Error de Hook o Producto no encontrado (tras la carga)
    if (error || !product || product.active === false) {
        // Redirigir inmediatamente si el producto no existe o hubo un error de BBDD
        //navigate('/', { replace: true });
        setIsValidId(false);
        return null;
    }

    // 10. Renderizado Principal
    return (
        <div className="container my-5">
            {/* ⬅️ BREADCRUMB */}
            <div
                className="mb-4 p-2 rounded shadow-sm d-flex justify-content-center"
                style={{ backgroundColor: '#c7d088' }}
            >
                <div className="small">
                    <Link to="/" className="text-decoration-none text-dark fw-bold">Productos</Link>
                    <span className="text-dark">{' > '}</span>
                    <Link to="/" className="text-decoration-none text-dark fw-bold">
                        {product.type?.name || 'Tipo'}
                    </Link>
                    <span className="text-dark">{' > '}</span>
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
                                <p className="mb-2"><strong>Opciones:</strong></p>
                                <div className="d-flex flex-wrap gap-2">
                                    {product.options.map((option, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`btn btn-sm ${option === selectedOption ? "btn-dark" : "btn-outline-dark"}`}
                                            onClick={() => setSelectedOption(option)}
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