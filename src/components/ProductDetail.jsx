// components/ProductDetail.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsCartPlus } from "react-icons/bs";
import { Base64 } from 'js-base64';
import useOptions from "../hooks/useOptions";

const ProductDetail = () => {
    // Hooks de React Router y Store
    const { id: encodedId } = useParams(); // ID codificado de la URL
    const navigate = useNavigate();
    const { addToCart } = useCartStore();

    // Estados
    // Opciones seleccionadas por grupo (útil si hay múltiples grupos de opciones)
    const [selectedGroupOptions, setSelectedGroupOptions] = useState({});
    // Habilitar o Deshabilitar el botón del carrito
    const [canAddToCart, setCanAddToCart] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [productId, setProductId] = useState('-1');
    const [isValidId, setIsValidId] = useState(true); // Estado para manejar ID inválido
    const [listOptionsProduct, setListOptionsProduct] = useState([]);
    const [precioWithAdd, setPrecioWithAdd] = useState(0);

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
        decodeAndValidateId();
    }, [decodeAndValidateId]); // Ejecutar solo cuando el componente se monta o el ID codificado cambia


    // 3. useEffect para manejar la redirección si el ID es inválido
    useEffect(() => {
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

    const {
        data: listOptions,
        loadingOptions,
        errorOptions
    } = useOptions({ id_product: productId });

    
    useEffect(() => {
        if (product?.name) {
            // Formato deseado: "Cucharaita - Nombre del Producto"
            document.title = `Cucharaita - ${product.name}`;
        } else {
            // Título por defecto mientras carga o si hay error/no se encuentra
            document.title = 'Cucharaita - Producto';
        }

        // Limpieza: restablece el título cuando el componente se desmonta (opcional pero recomendado)
        return () => {
            document.title = 'Cucharaita'; // O el título principal de tu sitio
        };
    }, [product]);
    
    useEffect(() => {
        if (listOptions != null && product) {
            let uniqueGroups = groupOptionsByGroup(listOptions);
            setListOptionsProduct(uniqueGroups);
            // Inicializar el precio con el precio base del producto
            setPrecioWithAdd(product.price);
        }
    }, [listOptions, product]);

    /**
 * Agrupa las opciones por su campo 'group'.
 * @param {Array} listOptions - El array plano de opciones (con el grupo anidado).
 * @returns {Array} Array de objetos de grupo, cada uno con una propiedad 'options'.
 */
    const groupOptionsByGroup = (listOptions) => {
        if (!listOptions || listOptions.length === 0) {
            return [];
        }

        // 1. Usar un Map para agrupar las opciones por group.id
        const groupedMap = listOptions.reduce((acc, option) => {
            const groupId = option.group.id;

            // Si el grupo no existe en el Map, lo inicializamos
            if (!acc.has(groupId)) {
                acc.set(groupId, {
                    // Copiamos las propiedades del grupo
                    ...option.group,
                    // Inicializamos el array de opciones
                    options: []
                });
            }

            // 2. Añadir la opción actual al array 'options' del grupo correspondiente.
            // Creamos una copia de la opción y eliminamos la propiedad 'group' anidada
            // para evitar redundancia y ciclos.
            const optionData = { ...option };
            delete optionData.group;

            acc.get(groupId).options.push(optionData);

            return acc;
        }, new Map()); // Usamos Map en lugar de un objeto para mejor rendimiento

        // 3. Convertir el Map a un array para facilitar el mapeo en React
        return Array.from(groupedMap.values());
    };


    // ----------------------------------------------------
    // LÓGICA DE CÁLCULO DE PRECIO
    // ----------------------------------------------------
    const calculateTotalPrice = useCallback((productData, optionsSelected) => {
        if (!productData || productData.price == null) {
            return 0;
        }

        let priceBase = Number(productData.price);

        Object.values(optionsSelected || {})?.forEach((options) => {
            if (Array.isArray(options)) {
                options.forEach(option => {
                    if (option.add_price && option.add_price > 0) {
                        priceBase += Number(option.add_price);
                    }
                });
            } else {
                if (options && options.add_price && options.add_price > 0) {
                    priceBase += Number(options.add_price);
                }
            }
        });

        return priceBase;
    }, []);

    // 🛑 useEffect para recalcular el precio total CADA VEZ que cambian las opciones
    useEffect(() => {
        if (product) {
            const newPrice = calculateTotalPrice(product, selectedGroupOptions);
            setPrecioWithAdd(newPrice);
        }
    }, [product, selectedGroupOptions, calculateTotalPrice]);
    // ----------------------------------------------------
    // FIN DE CÁLCULO DE PRECIO
    // ----------------------------------------------------

    // 5. Métodos de Cantidad (refactorizados a funciones claras)
    const increaseQuantity = useCallback(() => setQuantity(prev => prev + 1), []);
    const decreaseQuantity = useCallback(() => setQuantity(prev => Math.max(1, prev - 1)), []);


    // 6. Manejador de Agregar al Carrito (refactorizado a función clara)
    const handleAddToCart = useCallback((e) => {
        e.stopPropagation();

        if (!canAddToCart) {
            alert("Por favor, selecciona todas las opciones requeridas antes de añadir al carrito.");
            return;
        }

        // El precio final es el precio base más los extras de las opciones
        let finalPrice = precioWithAdd;

        // Creamos una copia simple del producto, pero con el precio actualizado
        let productAdd = { ...product, price: finalPrice };

        let listOptionsSelected = { ...selectedGroupOptions }

        // ... (Tu lógica existente de añadir al carrito) ...
        const productToAdd = {
            ...productAdd,
            options: listOptionsSelected,
            quantity: quantity,
        };

        addToCart(productToAdd);
    }, [product, selectedGroupOptions, quantity, addToCart, canAddToCart, precioWithAdd]);

    // 🛑 5. Función para manejar la selección de opciones
    const handleOptionSelect = useCallback((group, option) => {
        if (group.multiple == true) {
            // Múltiples opciones permitidas
            setSelectedGroupOptions(prev => {
                const currentSelections = prev[group.id] || [];
                let updatedSelections;
                if (currentSelections.some(selectedOption => selectedOption.id === option.id)) {
                    // Si ya está seleccionado, lo quitamos
                    updatedSelections = currentSelections.filter(selectedOption => selectedOption.id !== option.id);
                } else {
                    // Si no está seleccionado, lo añadimos
                    updatedSelections = [...currentSelections, option];
                }
                return {
                    ...prev,
                    [group.id]: updatedSelections
                };
            });
        }
        else {
            setSelectedGroupOptions(prev => ({
                ...prev,
                [group?.id]: option // Guarda la opción seleccionada bajo la clave del ID del grupo
            }));
        }

    }, []);

    // 🛑 6. Función de validación del carrito
    const validateAddToCart = useCallback(() => {
        // 1. Verificar cantidad mínima
        if (quantity < 1) {
            setCanAddToCart(false);
            return;
        }

        // 2. Verificar si hay grupos de opciones y si todos los obligatorios están seleccionados
        if (listOptionsProduct.length > 0) {
            // Un grupo es obligatorio si no tiene 'multiple: true' (ajustar según tu lógica)
            const requiredGroups = listOptionsProduct;

            const allRequiredSelected = requiredGroups.every(group =>
                selectedGroupOptions.hasOwnProperty(group.id) && selectedGroupOptions[group.id] !== null && selectedGroupOptions[group.id].length !== 0
            );

            setCanAddToCart(allRequiredSelected);
            return;
        }

        // Si no hay opciones de grupo, solo importa la cantidad
        setCanAddToCart(true);

    }, [quantity, listOptionsProduct, selectedGroupOptions]);

    // 🛑 7. useEffect para disparar la validación cuando las dependencias cambian
    useEffect(() => {
        validateAddToCart();
    }, [quantity, listOptionsProduct, selectedGroupOptions, validateAddToCart]);

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

    const isOptionSelected = (option, group) => {
        if (group.multiple == false && selectedGroupOptions[group?.id]?.id === option.id) {
            return true;
        }
        else if (group.multiple == true && Array.isArray(selectedGroupOptions[group?.id])) {
            return selectedGroupOptions[group?.id]?.some(selectedOption => selectedOption.id === option.id);
        }

        return false;
    };


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

                    {/* 🛑 NUEVA SECCIÓN DE PRECIOS */}
                    <div className="mt-4 mb-3 d-flex align-items-center">
                        {/* Si el precio calculado es diferente al base, mostramos el base tachado */}
                        {precioWithAdd !== product.price ? (
                            <div className="me-3">
                                <small className="text-muted d-block fw-light">Precio Base:</small>
                                <h2 className="text-decoration-line-through text-danger mb-0">
                                    {Number(product.price).toFixed(2)} €
                                </h2>
                            </div>
                        ) : null}

                        {/* Precio Final (Siempre visible y grande) */}
                        <div>
                            <small className="text-muted d-block fw-light">
                                {precioWithAdd !== product.price ? 'Precio Total:' : 'Precio:'}
                            </small>
                            <h2 className={`mb-0 ${precioWithAdd !== product.price ? 'text-success' : 'text-dark'}`}>
                                {Number(precioWithAdd).toFixed(2)} €
                            </h2>
                        </div>
                    </div>
                    {/* 🛑 FIN DE NUEVA SECCIÓN DE PRECIOS */}

                    {/* Opciones */}
                    {listOptionsProduct.length > 0 && (
                        <div className="mt-4">
                            <div className="mb-3">
                                {listOptionsProduct?.map((group, index) => (
                                    <>
                                        <p key={'title_group_' + index} className="mb-2">
                                            <strong>{group.name}
                                                {group.multiple == false ? ' (Una opción)' : ' (Varias opciones)'}:</strong>
                                        </p>
                                        <div className="d-flex flex-wrap gap-2">
                                            {group.options.map((option, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className={`btn btn-sm ${isOptionSelected(option, group) ? "btn-dark" : "btn-outline-dark"}`}
                                                    onClick={() => handleOptionSelect(group, option)}
                                                >
                                                    {option.name} {option.add_price > 0 ? `( +${option.add_price} € )` : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ))}
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
                        disabled={!canAddToCart}
                    >
                        Agregar al carrito ({quantity}) &nbsp; <BsCartPlus />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;