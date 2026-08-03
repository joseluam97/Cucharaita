import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsDashCircle, BsPlusCircle, BsXCircleFill, BsSlashCircle, BsBagCheckFill } from "react-icons/bs";
import { Base64 } from 'js-base64';
import useGroups from "../hooks/useGroups";
import { getGroupOptionsByGroup } from "../hooks/useOptions";

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
    const { data: listProductGroups } = useGroups({ id_product: productId });



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
        // Creamos la función asíncrona dentro del useEffect

        if (listProductGroups != null && product) {
            loadGroupOptions();
        }

    }, [listProductGroups, product, getBasePrice]);

    const loadGroupOptions = async () => {
        if (listProductGroups != null && product) {
            try {
                // Usamos map con Promise.all y tu función centralizada
                const groupPromises = listProductGroups.map(async (productGroup) => {

                    const listGroupOption = await getGroupOptionsByGroup(productGroup.group.id);

                    let listOptions = [];
                    listGroupOption.forEach(group_option => {
                        group_option.option.add_price = Number(group_option.add_price);
                        listOptions.push(group_option.option);
                    });

                    return {
                        ...productGroup.group,
                        is_multiple: productGroup.is_multiple,
                        is_required: productGroup.is_required,
                        option_select: productGroup.option_select,
                        options: listOptions || []
                    };
                });

                // Esperamos a que terminen todas las consultas de golpe
                const all_options = await Promise.all(groupPromises);

                setListOptionsProduct(all_options);
                setPrecioWithAdd(getBasePrice(product));

            } catch (error) {
                console.error("Error al cargar las opciones:", error);
            }
        }
    };

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

            if (group.is_multiple) {
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
            price: precioWithAdd,
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

    const isAvailable = product.available;
    const hasOffer = product.offer_price && Number(product.offer_price) > 0;
    const basePrice = getBasePrice(product);

    return (
        <div className="container my-5 pt-4">
            <div className="row bg-white p-3 p-md-5 rounded-4 shadow-sm border border-brand-light">
                {/* COLUMNA IZQUIERDA: IMAGEN */}
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
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-4 bg-brand-cream/70 z-20">
                                <span className="badge shadow px-4 py-3 text-uppercase fs-5 bg-brand-primary text-brand-white">
                                    Agotado temporalmente
                                </span>
                            </div>
                        )}

                        {isAvailable && hasOffer && (
                            <span className="position-absolute top-0 end-0 m-3 badge shadow px-3 py-2 fs-6 z-10 bg-brand-accent text-brand-primary">
                                ¡OFERTA ESPECIAL!
                            </span>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: INFORMACIÓN Y ACCIONES */}
                <div className="col-md-6 d-flex flex-column px-md-4">
                    <div className="mb-2">
                        <span className="badge px-3 py-2 bg-brand-light text-brand-primary text-[0.85rem]">
                            {product.type?.name}
                        </span>
                    </div>

                    <h1 className="fw-bold mb-3 text-brand-black font-cooper text-[2.5rem]">
                        {product.name}
                    </h1>

                    <p className="lead text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                        {product.description}
                    </p>

                    <div className="h2 mb-4 fw-bold p-3 rounded-3 inline-block bg-brand-cream self-start">
                        {hasOffer ? (
                            <>
                                <span className="me-3 text-brand-primary">{Number(precioWithAdd).toFixed(2)} €</span>
                                {precioWithAdd === basePrice && (
                                    <small className="text-muted text-decoration-line-through fs-5">
                                        {Number(product.price).toFixed(2)} €
                                    </small>
                                )}
                            </>
                        ) : (
                            <span className="text-brand-primary">{Number(precioWithAdd).toFixed(2)} €</span>
                        )}
                    </div>

                    {!isAvailable && (
                        <div className="alert d-flex align-items-center mb-4 border-0 bg-brand-cream text-brand-primary">
                            <BsSlashCircle className="me-3" size={24} />
                            <strong>Estamos horneando más unidades. ¡Vuelve pronto!</strong>
                        </div>
                    )}

                    {/* SECCIÓN DE OPCIONES */}
                    <div style={{ opacity: isAvailable ? 1 : 0.5, pointerEvents: isAvailable ? 'auto' : 'none' }}>
                        {listOptionsProduct.map((group) => (
                            <div key={group.id} className="mb-4">
                                <h6 className="fw-bold d-flex justify-content-between align-items-center mb-3 text-brand-dark">
                                    {group.name}{group.is_multiple == true ? ' (Múltiple)' : ' (Única)'}
                                    {group.option_select > 0 && (
                                        <span className="badge rounded-pill bg-brand-secondary text-brand-white">
                                            {(selectedGroupOptions[group.id]?.length || 0)} / {group.option_select}
                                        </span>
                                    )}
                                </h6>
                                <div className="d-flex flex-wrap gap-2">
                                    {group.options.map((option) => {
                                        const count = getOptionCount(group.id, option.id);
                                        const limitReached = group.is_multiple && group.option_select > 0 && (selectedGroupOptions[group.id]?.length >= group.option_select);

                                        // 1. Definimos la condición de visibilidad
                                        const isVisible = !group.is_multiple || (group.is_multiple && selectedGroupOptions[group.id]?.length == group.option_select);
                                        // 2. Si no es visible, retornamos null (esto le dice a React: "aquí no pintes nada")
                                        if (isVisible) return null;

                                        // 3. Si sí es visible, retornamos el botón
                                        return (
                                            <button
                                                key={option.id}
                                                className={`d-flex align-items-center gap-2 rounded-pill px-1 py-1 shadow-sm border-2 font-bold text-sm transition-all duration-200 ${count > 0
                                                    ? 'bg-brand-primary text-brand-white border-brand-primary hover:bg-brand-accent hover:text-brand-primary hover:border-brand-accent'
                                                    : 'bg-brand-white text-brand-primary border-brand-primary hover:bg-brand-cream'
                                                    }`}
                                                onClick={() => handleOptionSelect(group, option)}
                                                disabled={!isAvailable || (limitReached && !(!group.is_multiple && count > 0))}
                                            >
                                                {option.name}
                                                {option.add_price > 0 && <small className="opacity-80 fw-normal">(+{option.add_price}€)</small>}
                                                {count > 0 && <span className="badge bg-white text-brand-primary rounded-circle ms-1">{count}</span>}
                                            </button>
                                        );
                                    })}
                                </div>

                            </div>
                        ))}
                    </div>


                    {Object.values(selectedGroupOptions).some(s => Array.isArray(s) ? s.length > 0 : !!s) && (
                        <div className="mb-4">
                            <p className="fw-bold mb-2">Productos añadidos:</p>
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

                    {/* BOTONES DE ACCIÓN */}
                    <div className="d-flex align-items-center gap-3 pt-4 mt-auto border-top">
                        <div className={`d-flex align-items-center border-0 rounded-pill shadow-sm px-2 ${!isAvailable ? 'bg-gray-100 text-gray-500' : 'bg-brand-cream'}`}>
                            <button className={`btn btn-link py-2 border-0 ${!isAvailable ? 'text-gray-500' : 'text-brand-primary'}`} onClick={decreaseQuantity} disabled={!isAvailable || quantity <= 1}>
                                <BsDashCircle size={20} />
                            </button>
                            <span className={`px-3 fw-bold fs-5 ${!isAvailable ? 'text-gray-500' : 'text-brand-primary'}`}>{quantity}</span>
                            <button className={`btn btn-link py-2 border-0 ${!isAvailable ? 'text-gray-500' : 'text-brand-primary'}`} onClick={increaseQuantity} disabled={!isAvailable}>
                                <BsPlusCircle size={20} />
                            </button>
                        </div>

                        <button
                            className={`btn btn-lg flex-grow-1 rounded-pill shadow d-flex justify-content-center align-items-center gap-2 p-3 font-bold border-0 transition-all duration-300 ${(!isAvailable || !canAddToCart) ? 'bg-gray-200 text-gray-500' : 'bg-brand-primary text-brand-white hover:bg-brand-secondary hover:-translate-y-1'}`}
                            onClick={handleAddToCart}
                            disabled={!isAvailable || !canAddToCart}
                        >
                            <BsBagCheckFill size={20} />
                            {!isAvailable
                                ? "Agotado"
                                : `Añadir al carrito (${Number(precioWithAdd * quantity).toFixed(2)} €)`
                            }
                        </button>
                    </div>
                </div>
                {/* SECCIÓN DE INGREDIENTES Y ALÉRGENOS */}
                {product.ingredients && (
                    <div className="mt-5 p-4 rounded-4 bg-brand-cream/30 border border-brand-cream">
                        <h6 className="fw-bold text-brand-dark mb-1" style={{ fontSize: '0.95rem' }}>
                            Ingredientes
                        </h6>
                        <p className="mb-3 text-muted fst-italic" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                            {product.ingredients}
                        </p>

                        {product.allergens && (
                            <>
                                <h6 className="fw-bold text-brand-dark mb-1" style={{ fontSize: '0.95rem' }}>
                                    Alérgenos
                                </h6>
                                <p className="mb-0 text-muted fst-italic" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                                    {product.allergens}
                                </p>
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductDetail;