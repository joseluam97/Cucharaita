// components/ProductDetail.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsCartPlus, BsDashCircle, BsPlusCircle, BsXCircleFill } from "react-icons/bs";
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

    const { data: product, loading, error } = useProducts({ id: productId });
    const { data: listOptions } = useOptions({ id_product: productId });

    useEffect(() => {
        if (product?.name) document.title = `Cucharaita - ${product.name}`;
        return () => { document.title = 'Cucharaita'; };
    }, [product]);

    useEffect(() => {
        if (listOptions != null && product) {
            let uniqueGroups = groupOptionsByGroup(listOptions);
            setListOptionsProduct(uniqueGroups);
            setPrecioWithAdd(product.price);
        }
    }, [listOptions, product]);

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

    const calculateTotalPrice = useCallback((productData, optionsSelected) => {
        if (!productData || productData.price == null) return 0;
        let priceBase = Number(productData.price);

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
    }, []);

    useEffect(() => {
        if (product) {
            setPrecioWithAdd(calculateTotalPrice(product, selectedGroupOptions));
        }
    }, [product, selectedGroupOptions, calculateTotalPrice]);

    // 🛑 NUEVA LÓGICA: SELECCIÓN MULTI-INSTANCIA
    const handleOptionSelect = useCallback((group, option) => {
        setSelectedGroupOptions(prev => {
            const currentSelections = prev[group.id] || [];
            
            if (group.multiple) {
                const limit = Number(group.option_select);
                // Si hay límite y ya se alcanzó, no añadir más
                if (limit > 0 && currentSelections.length >= limit) {
                    alert(`Has alcanzado el límite de ${limit} opciones para ${group.name}`);
                    return prev;
                }
                // Añadimos una nueva instancia (incluso si es el mismo ID)
                // Usamos un identificador único temporal (timestamp) para poder borrar uno específico luego
                const optionWithUniqueKey = { ...option, tempId: Date.now() + Math.random() };
                return { ...prev, [group.id]: [...currentSelections, optionWithUniqueKey] };
            } else {
                // Si no es múltiple, se comporta como radio button normal
                return { ...prev, [group.id]: option };
            }
        });
    }, []);

    // 🛑 ELIMINAR UNA INSTANCIA ESPECÍFICA
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
        if (quantity < 1) return setCanAddToCart(false);
        
        if (listOptionsProduct.length > 0) {
            const allRequiredSatisfied = listOptionsProduct.every(group => {
                const selection = selectedGroupOptions[group.id];
                const limit = Number(group.option_select);

                // Si tiene un límite (option_select > 0), debe ser exactamente ese número
                if (limit > 0) {
                    const currentCount = Array.isArray(selection) ? selection.length : (selection ? 1 : 0);
                    return currentCount === limit;
                }
                
                // Si limit es 0, basta con que haya algo seleccionado (si el grupo es obligatorio)
                return selection && (Array.isArray(selection) ? selection.length > 0 : !!selection);
            });
            
            setCanAddToCart(allRequiredSatisfied);
            return;
        }
        setCanAddToCart(true);
    }, [quantity, listOptionsProduct, selectedGroupOptions]);

    useEffect(() => {
        validateAddToCart();
    }, [quantity, listOptionsProduct, selectedGroupOptions, validateAddToCart]);
    
    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!canAddToCart) return;

        // Enviar al store
        addToCart({ 
            ...product, 
            price: precioWithAdd, 
            options: { ...selectedGroupOptions }, 
            quantity: quantity 
        });

        // --- LIMPIEZA DE ESTADOS ---
        setSelectedGroupOptions({}); // Resetea las opciones
        setQuantity(1);             // Resetea la cantidad a 1
        setPrecioWithAdd(product.price); // Resetea el precio visual al base
        
    };

    // Auxiliar para contar cuántas veces se ha seleccionado una opción específica
    const getOptionCount = (groupId, optionId) => {
        const selections = selectedGroupOptions[groupId];
        if (!Array.isArray(selections)) return selections?.id === optionId ? 1 : 0;
        return selections.filter(opt => opt.id === optionId).length;
    };

    if (isValidId === false) return <div className="container my-5 text-center"><h1>❌ Error</h1></div>;
    if (loading || !productId) return <div className="container my-5 text-center">Cargando...</div>;

    return (
        <div className="container my-5">
            {/* Breadcrumb omitido por brevedad, mantener el tuyo */}
            
            <div className="row">
                <div className="col-md-6 mb-4">
                    <img src={product.image} alt={product.name} className="img-fluid rounded shadow" />
                </div>

                <div className="col-md-6">
                    <span className="badge bg-secondary mb-2">{product.type?.name}</span>
                    <h1 className="fw-bold">{product.name}</h1>
                    <p className="lead">{product.description}</p>

                    <div className="h3 mb-4 fw-bold text-success">
                        {Number(precioWithAdd).toFixed(2)} €
                        {precioWithAdd !== product.price && <small className="text-muted text-decoration-line-through ms-2 fs-6">{Number(product.price).toFixed(2)} €</small>}
                    </div>

                    {/* SELECTOR DE OPCIONES DISPONIBLES */}
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
                                            disabled={limitReached && !(!group.multiple && count > 0)}
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

                    {/* RESUMEN DE ELEMENTOS SELECCIONADOS (LISTA INFERIOR) */}
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
                                                <BsXCircleFill 
                                                    className="text-danger fs-5" 
                                                    style={{ cursor: 'pointer' }} 
                                                    onClick={() => removeOneInstance(group.id, opt.tempId)}
                                                />
                                            </div>
                                        </div>
                                    ));
                                })}
                            </div>
                        </div>
                    )}

                    {/* ACCIONES FINALES */}
                    <div className="d-flex align-items-center gap-3 pt-3 border-top mt-4">
                        <div className="d-flex align-items-center border rounded">
                            <button className="btn btn-link text-dark py-2" onClick={decreaseQuantity} disabled={quantity <= 1}><BsDashCircle /></button>
                            <span className="px-3 fw-bold">{quantity}</span>
                            <button className="btn btn-link text-dark py-2" onClick={increaseQuantity}><BsPlusCircle /></button>
                        </div>
                        <button 
                            className="btn btn-dark btn-lg flex-grow-1" 
                            onClick={handleAddToCart}
                            disabled={!canAddToCart}
                        >
                            Añadir al carrito ({Number(precioWithAdd * quantity).toFixed(2)} €)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;