import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsDashCircle, BsPlusCircle, BsXCircleFill, BsSlashCircle } from "react-icons/bs";
import { Base64 } from 'js-base64';
import useOptions from "../hooks/useOptions";

const ProductDetail = () => {
    const { id: encodedId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCartStore();

    // Estados
    const [selectedGroupOptions, setSelectedGroupOptions] = useState({});
    const [canAddToCart, setCanAddToCart] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [productId, setProductId] = useState('-1');
    const [isValidId, setIsValidId] = useState(true);
    const [listOptionsProduct, setListOptionsProduct] = useState([]);
    const [precioWithAdd, setPrecioWithAdd] = useState(0);

    const decodeAndValidateId = useCallback(() => {
        try {
            const decodedId = Base64.decode(encodedId);
            const currentProductId = parseInt(decodedId, 10);
            if (isNaN(currentProductId) || currentProductId <= 0) throw new Error("ID inválido");
            setProductId(currentProductId);
            setIsValidId(true);
        } catch (error) {
            setIsValidId(false);
            setProductId(null);
        }
    }, [encodedId]);

    useEffect(() => {
        decodeAndValidateId();
    }, [decodeAndValidateId]);

    useEffect(() => {
        if (isValidId === false) {
            const timer = setTimeout(() => navigate('/', { replace: true }), 3000);
            return () => clearTimeout(timer);
        }
    }, [isValidId, navigate]);

    const { data: product, loading } = useProducts({ id: productId });
    const { data: listOptions } = useOptions({ id_product: productId });

    useEffect(() => {
        if (product?.name) document.title = `Cucharaita - ${product.name}`;
        return () => { document.title = 'Cucharaita'; };
    }, [product]);

    // 🛑 HELPER PARA OBTENER PRECIO BASE (OFERTA O NORMAL)
    const getBasePrice = useCallback((prod) => {
        if (!prod) return 0;
        if (prod.offer_price && Number(prod.offer_price) > 0) {
            return Number(prod.offer_price);
        }
        return Number(prod.price);
    }, []);

    useEffect(() => {
        if (listOptions != null && product) {
            let uniqueGroups = groupOptionsByGroup(listOptions);
            setListOptionsProduct(uniqueGroups);
            // 🛑 Inicializamos con el precio base correcto (oferta o normal)
            setPrecioWithAdd(getBasePrice(product));
        }
    }, [listOptions, product, getBasePrice]);

    const groupOptionsByGroup = (listOptions) => {
        if (!listOptions || listOptions.length === 0) return [];
        const groupedMap = listOptions.reduce((acc, option) => {
            const groupId = option.group.id;
            if (!acc.has(groupId)) {
                acc.set(groupId, { ...option.group, options: [] });
            }
            const optionData = { ...option };
            delete optionData.group;
            acc.get(groupId).options.push(optionData);
            return acc;
        }, new Map());
        return Array.from(groupedMap.values());
    };

    // 🛑 MODIFICADO: CALCULAR PRECIO TOTAL USANDO LA BASE CORRECTA
    const calculateTotalPrice = useCallback((productData, optionsSelected) => {
        if (!productData) return 0;
        
        // Usamos el helper para saber si partimos del precio de oferta o el normal
        let priceBase = getBasePrice(productData);

        Object.values(optionsSelected || {}).forEach((options) => {
            if (Array.isArray(options)) {
                options.forEach(opt => {
                    if (opt.add_price > 0) priceBase += Number(opt.add_price);
                });
            } else if (options?.add_price > 0) {
                priceBase += Number(options.add_price);
            }
        });
        return priceBase;
    }, [getBasePrice]);

    useEffect(() => {
        if (product) {
            setPrecioWithAdd(calculateTotalPrice(product, selectedGroupOptions));
        }
    }, [product, selectedGroupOptions, calculateTotalPrice]);

    const handleOptionSelect = useCallback((group, option) => {
        if (product && !product.available) return;

        setSelectedGroupOptions(prev => {
            const currentSelections = prev[group.id] || [];

            if (group.multiple) {
                const limit = Number(group.option_select);
                if (limit > 0 && currentSelections.length >= limit) {
                    alert(`Has alcanzado el límite de ${limit} opciones para ${group.name}`);
                    return prev;
                }
                const optionWithUniqueKey = { ...option, tempId: Date.now() + Math.random() };
                return { ...prev, [group.id]: [...currentSelections, optionWithUniqueKey] };
            } else {
                return { ...prev, [group.id]: option };
            }
        });
    }, [product]);

    const removeOneInstance = (groupId, tempId) => {
        setSelectedGroupOptions(prev => {
            const current = prev[groupId];
            if (Array.isArray(current)) {
                return { ...prev, [groupId]: current.filter(opt => opt.tempId !== tempId) };
            } else {
                const { [groupId]: _, ...rest } = prev;
                return rest;
            }
        });
    };

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    const validateAddToCart = useCallback(() => {
        if (product && !product.available) {
            setCanAddToCart(false);
            return;
        }

        if (quantity < 1) return setCanAddToCart(false);

        if (listOptionsProduct.length > 0) {
            const allRequiredSatisfied = listOptionsProduct.every(group => {
                const selection = selectedGroupOptions[group.id];
                const limit = Number(group.option_select);

                if (limit > 0) {
                    const currentCount = Array.isArray(selection) ? selection.length : (selection ? 1 : 0);
                    return currentCount === limit;
                }

                return selection && (Array.isArray(selection) ? selection.length > 0 : !!selection);
            });

            setCanAddToCart(allRequiredSatisfied);
            return;
        }
        setCanAddToCart(true);
    }, [quantity, listOptionsProduct, selectedGroupOptions, product]);

    useEffect(() => {
        validateAddToCart();
    }, [quantity, listOptionsProduct, selectedGroupOptions, validateAddToCart]);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!canAddToCart || (product && !product.available)) return;

        addToCart({
            ...product,
            price: precioWithAdd, // Este precio ya incluye oferta + opciones
            options: { ...selectedGroupOptions },
            quantity: quantity
        });

        setSelectedGroupOptions({});
        setQuantity(1);
        setPrecioWithAdd(getBasePrice(product));
    };

    const getOptionCount = (groupId, optionId) => {
        const selections = selectedGroupOptions[groupId];
        if (!Array.isArray(selections)) return selections?.id === optionId ? 1 : 0;
        return selections.filter(opt => opt.id === optionId).length;
    };

    if (isValidId === false) return <div className="container my-5 text-center"><h1>❌ Error</h1></div>;
    if (loading || !productId) return <div className="container my-5 text-center">Cargando...</div>;

    const isMobile = window.innerWidth < 768; 
    const isAvailable = product.available;
    // 🛑 Detectar si hay oferta
    const hasOffer = product.offer_price && Number(product.offer_price) > 0;
    const basePrice = getBasePrice(product);

    return (
        <div className="container my-5">
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="position-relative">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="img-fluid rounded shadow mb-4" 
                            style={{ 
                                width: "100%",          
                                height: "500px",        
                                objectFit: "cover",
                                opacity: isAvailable ? 1 : 0.6,
                                filter: isAvailable ? 'none' : 'grayscale(100%)'
                            }}
                        />

                        {!isAvailable && (
                            <div 
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                                style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", zIndex: 20 }}
                            >
                                <span className="badge bg-danger fs-4 shadow px-4 py-3 text-uppercase">
                                    Agotado / No disponible
                                </span>
                            </div>
                        )}

                        {isAvailable && hasOffer && (
                             <span className="position-absolute top-0 end-0 m-3 badge shadow bg-danger fs-5" style={{ zIndex: 15 }}>
                                ¡OFERTA!
                             </span>
                        )}

                        {isAvailable && product.tag?.title && (
                            <span 
                                className="position-absolute top-0 start-0 m-3 badge shadow"
                                style={{ 
                                    backgroundColor: product.tag.color || "#000",
                                    color: "#fff",
                                    fontSize: isMobile ? "0.9rem" : "1rem", 
                                    fontWeight: "700",
                                    textTransform: "capitalize",
                                    zIndex: 10,
                                    borderRadius: "5px",
                                    padding: "8px 12px"
                                }}
                            >
                                {product.tag.title}
                            </span>
                        )}
                    </div>
                </div>

                <div className="col-md-6">
                    <span className="badge bg-secondary mb-2">{product.type?.name}</span>
                    <h1 className="fw-bold">{product.name}</h1>
                    <p className="lead">{product.description}</p>

                    <div className="h3 mb-4 fw-bold">
                         {/* 🛑 LÓGICA DE VISUALIZACIÓN DE PRECIO EN DETALLE */}
                         {hasOffer ? (
                             <>
                                <span className="text-danger me-2">{Number(precioWithAdd).toFixed(2)} €</span>
                                {/* Si no se han añadido opciones extra, mostramos el precio original tachado */}
                                {precioWithAdd === basePrice && (
                                    <small className="text-muted text-decoration-line-through fs-6">
                                        {Number(product.price).toFixed(2)} €
                                    </small>
                                )}
                             </>
                         ) : (
                             <span className="text-success">{Number(precioWithAdd).toFixed(2)} €</span>
                         )}
                    </div>

                    {!isAvailable && (
                        <div className="alert alert-warning border-warning d-flex align-items-center mb-4">
                            <BsSlashCircle className="me-2" size={20} />
                            <strong>Lo sentimos, este producto no está disponible en este momento.</strong>
                        </div>
                    )}

                    <div style={{ opacity: isAvailable ? 1 : 0.5, pointerEvents: isAvailable ? 'auto' : 'none' }}>
                        {listOptionsProduct.map((group) => (
                            <div key={group.id} className="mb-4 p-3 border rounded shadow-sm bg-white">
                                <h6 className="fw-bold d-flex justify-content-between align-items-center">
                                    {group.name}
                                    {group.option_select > 0 && (
                                        <span className="badge rounded-pill bg-light text-dark border">
                                            {(selectedGroupOptions[group.id]?.length || 0)} / {group.option_select}
                                        </span>
                                    )}
                                </h6>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {group.options.map((option) => {
                                        const count = getOptionCount(group.id, option.id);
                                        const limitReached = group.multiple && group.option_select > 0 && (selectedGroupOptions[group.id]?.length >= group.option_select);

                                        return (
                                            <button
                                                key={option.id}
                                                className={`btn btn-sm d-flex align-items-center gap-2 ${count > 0 ? "btn-dark" : "btn-outline-dark"}`}
                                                onClick={() => handleOptionSelect(group, option)}
                                                disabled={!isAvailable || (limitReached && !(!group.multiple && count > 0))}
                                            >
                                                {option.name}
                                                {option.add_price > 0 && <small>(+{option.add_price}€)</small>}
                                                {count > 0 && <span className="badge bg-primary">{count}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {Object.values(selectedGroupOptions).some(s => Array.isArray(s) ? s.length > 0 : !!s) && (
                        <div className="mb-4">
                            <p className="fw-bold mb-2">Elementos añadidos:</p>
                            <div className="list-group shadow-sm">
                                {listOptionsProduct.map(group => {
                                    const selection = selectedGroupOptions[group.id];
                                    if (!selection || (Array.isArray(selection) && selection.length === 0)) return null;

                                    const items = Array.isArray(selection) ? selection : [selection];
                                    return items.map((opt, idx) => (
                                        <div key={opt.tempId || idx} className="list-group-item d-flex justify-content-between align-items-center py-2">
                                            <div>
                                                <span className="fw-bold text-primary mr-2">•</span> {opt.name}
                                                <small className="text-muted ms-2">({group.name})</small>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                {opt.add_price > 0 && <span className="small">+{Number(opt.add_price).toFixed(2)}€</span>}
                                                {isAvailable && (
                                                    <BsXCircleFill
                                                        className="text-danger fs-5"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => removeOneInstance(group.id, opt.tempId)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ));
                                })}
                            </div>
                        </div>
                    )}

                    <div className="d-flex align-items-center gap-3 pt-3 border-top mt-4">
                        <div className={`d-flex align-items-center border rounded ${!isAvailable ? 'bg-light text-muted' : ''}`}>
                            <button 
                                className="btn btn-link text-dark py-2" 
                                onClick={decreaseQuantity} 
                                disabled={!isAvailable || quantity <= 1}
                            >
                                <BsDashCircle />
                            </button>
                            <span className="px-3 fw-bold">{quantity}</span>
                            <button 
                                className="btn btn-link text-dark py-2" 
                                onClick={increaseQuantity}
                                disabled={!isAvailable}
                            >
                                <BsPlusCircle />
                            </button>
                        </div>
                        <button
                            className={`btn btn-lg flex-grow-1 ${!isAvailable ? 'btn-secondary' : 'btn-dark'}`}
                            onClick={handleAddToCart}
                            disabled={!isAvailable || !canAddToCart} 
                        >
                            {!isAvailable 
                                ? "Producto Agotado" 
                                : `Añadir al carrito (${Number(precioWithAdd * quantity).toFixed(2)} €)`
                            }
                        </button>
                    </div>
                </div>

                <div className="col-md-12 mb-0">
                    {product.ingredients && (
                        <div className="p-3 bg-light rounded border border-secondary border-opacity-25">
                            <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>
                                Ingredientes
                            </h6>
                            <p className="mb-0 text-secondary small fst-italic" style={{ lineHeight: '1.5' }}>
                                {product.ingredients}
                            </p>
                            <h6 className="fw-bold text-dark mb-2 mt-4" style={{ fontSize: '0.9rem' }}>
                                Alérgenos
                            </h6>
                            <p className="mb-0 text-secondary small fst-italic" style={{ lineHeight: '1.5' }}>
                                {product.allergens}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;