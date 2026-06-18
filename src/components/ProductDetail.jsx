import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsDashCircle, BsPlusCircle, BsXCircleFill, BsSlashCircle, BsBagCheckFill } from "react-icons/bs";
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

    return (<div className="container my-5 pt-4">
            <div className="row bg-white p-3 p-md-5 rounded-4 shadow-sm" style={{ border: '1px solid var(--cucharaita-secundario-2)' }}>
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="position-relative">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="img-fluid rounded-4 shadow-sm mb-4 w-100" 
                            style={{ 
                                height: "500px",        
                                objectFit: "cover",
                                opacity: isAvailable ? 1 : 0.6,
                                filter: isAvailable ? 'none' : 'grayscale(100%)'
                            }}
                        />

                        {!isAvailable && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-4" style={{ backgroundColor: "rgba(242, 232, 181, 0.7)", zIndex: 20 }}>
                                <span className="badge shadow px-4 py-3 text-uppercase fs-5" style={{ backgroundColor: 'var(--cucharaita-principal)', color: 'var(--text-light)' }}>
                                    Agotado temporalmente
                                </span>
                            </div>
                        )}

                        {isAvailable && hasOffer && (
                             <span className="position-absolute top-0 end-0 m-3 badge shadow px-3 py-2 fs-6" style={{ zIndex: 15, backgroundColor: 'var(--cucharaita-enfasis)', color: 'var(--cucharaita-principal)' }}>
                                ¡OFERTA ESPECIAL!
                             </span>
                        )}
                    </div>
                </div>

                <div className="col-md-6 d-flex flex-column justify-content-center px-md-4">
                    <div className="mb-2">
                        <span className="badge px-3 py-2" style={{ backgroundColor: 'var(--cucharaita-secundario-2)', color: 'var(--cucharaita-principal)', fontSize: '0.85rem' }}>
                            {product.type?.name}
                        </span>
                    </div>
                    
                    <h1 className="fw-bold mb-3" style={{ color: 'var(--cucharaita-principal)', fontFamily: "'Cooper Black', 'Baloo 2', serif", fontSize: '2.5rem' }}>
                        {product.name}
                    </h1>
                    
                    <p className="lead text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        {product.description}
                    </p>

                    <div className="h2 mb-4 fw-bold p-3 rounded-3" style={{ backgroundColor: 'var(--cucharaita-secundario-3)', display: 'inline-block' }}>
                         {hasOffer ? (
                             <>
                                <span style={{ color: 'var(--cucharaita-principal)' }} className="me-3">{Number(precioWithAdd).toFixed(2)} €</span>
                                {precioWithAdd === basePrice && (
                                    <small className="text-muted text-decoration-line-through fs-5">
                                        {Number(product.price).toFixed(2)} €
                                    </small>
                                )}
                             </>
                         ) : (
                             <span style={{ color: 'var(--cucharaita-principal)' }}>{Number(precioWithAdd).toFixed(2)} €</span>
                         )}
                    </div>

                    {!isAvailable && (
                        <div className="alert d-flex align-items-center mb-4 border-0" style={{ backgroundColor: 'var(--cucharaita-secundario-3)', color: 'var(--cucharaita-principal)' }}>
                            <BsSlashCircle className="me-3" size={24} />
                            <strong>Estamos horneando más unidades. ¡Vuelve pronto!</strong>
                        </div>
                    )}

                    {/* SECCIÓN DE OPCIONES */}
                    <div style={{ opacity: isAvailable ? 1 : 0.5, pointerEvents: isAvailable ? 'auto' : 'none' }}>
                        {listOptionsProduct.map((group) => (
                            <div key={group.id} className="mb-4">
                                <h6 className="fw-bold d-flex justify-content-between align-items-center mb-3" style={{ color: 'var(--text-dark)' }}>
                                    {group.name}
                                    {group.option_select > 0 && (
                                        <span className="badge rounded-pill" style={{ backgroundColor: 'var(--cucharaita-secundario-1)', color: 'var(--text-light)' }}>
                                            {(selectedGroupOptions[group.id]?.length || 0)} / {group.option_select}
                                        </span>
                                    )}
                                </h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {group.options.map((option) => {
                                        const count = getOptionCount(group.id, option.id);
                                        const limitReached = group.multiple && group.option_select > 0 && (selectedGroupOptions[group.id]?.length >= group.option_select);

                                        return (
                                            <button
                                                key={option.id}
                                                className="btn btn-sm d-flex align-items-center gap-2 rounded-pill px-3 py-2 shadow-sm"
                                                onClick={() => handleOptionSelect(group, option)}
                                                disabled={!isAvailable || (limitReached && !(!group.multiple && count > 0))}
                                                style={{
                                                    backgroundColor: count > 0 ? 'var(--cucharaita-principal)' : 'var(--text-light)',
                                                    color: count > 0 ? 'var(--text-light)' : 'var(--cucharaita-principal)',
                                                    border: `1px solid var(--cucharaita-principal)`,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {option.name}
                                                {option.add_price > 0 && <small className="opacity-75">(+{option.add_price}€)</small>}
                                                {count > 0 && <span className="badge bg-light text-primary rounded-circle ms-1">{count}</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="d-flex align-items-center gap-3 pt-4 border-top mt-auto">
                        <div className={`d-flex align-items-center border-0 rounded-pill shadow-sm px-2 ${!isAvailable ? 'bg-light text-muted' : ''}`} style={{ backgroundColor: 'var(--cucharaita-secundario-3)' }}>
                            <button className="btn btn-link py-2 border-0" onClick={decreaseQuantity} disabled={!isAvailable || quantity <= 1} style={{ color: 'var(--cucharaita-principal)' }}>
                                <BsDashCircle size={20} />
                            </button>
                            <span className="px-3 fw-bold fs-5" style={{ color: 'var(--cucharaita-principal)' }}>{quantity}</span>
                            <button className="btn btn-link py-2 border-0" onClick={increaseQuantity} disabled={!isAvailable} style={{ color: 'var(--cucharaita-principal)' }}>
                                <BsPlusCircle size={20} />
                            </button>
                        </div>
                        
                        <button
                            className="btn btn-lg flex-grow-1 rounded-pill shadow d-flex justify-content-center align-items-center gap-2"
                            onClick={handleAddToCart}
                            disabled={!isAvailable || !canAddToCart} 
                            style={{
                                backgroundColor: (!isAvailable || !canAddToCart) ? '#e9ecef' : 'var(--cucharaita-principal)',
                                color: (!isAvailable || !canAddToCart) ? '#6c757d' : 'var(--text-light)',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease',
                                border: 'none',
                                padding: '12px'
                            }}
                        >
                            <BsBagCheckFill size={20} />
                            {!isAvailable 
                                ? "Agotado" 
                                : `Añadir al carrito (${Number(precioWithAdd * quantity).toFixed(2)} €)`
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;