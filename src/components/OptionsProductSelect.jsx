import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { BsXCircleFill } from "react-icons/bs";
import { Base64 } from 'js-base64';
import useProducts from "../hooks/useProducts";
import useGroups from "../hooks/useGroups";
import { getGroupOptionsByGroup } from "../hooks/useOptions";

const OptionsProductSelect = ({ productId, quantity, selectedGroupOptions, setSelectedGroupOptions, setPrecioWithAdd, setCanAddToCart }) => {

    const { data: product, loading } = useProducts({ id: productId });
    const { data: listProductGroups } = useGroups({ id_product: productId });

    const [listOptionsProduct, setListOptionsProduct] = useState([]);

    const getBasePrice = useCallback((prod) => {
        if (!prod) return 0;
        if (prod.offer_price && Number(prod.offer_price) > 0) {
            return Number(prod.offer_price);
        }
        return Number(prod.price);
    }, []);


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


    useEffect(() => {
        // Creamos la función asíncrona dentro del useEffect
        if (listProductGroups != null && product) {
            loadGroupOptions();
        }

    }, [listProductGroups, product, getBasePrice]);

    const validateAddToCart = useCallback(() => {
        if (product && !product?.available) {
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

    const getOptionCount = (groupId, optionId) => {
        const selections = selectedGroupOptions[groupId];
        if (!Array.isArray(selections)) return selections?.id === optionId ? 1 : 0;
        return selections.filter(opt => opt.id === optionId).length;
    };

    const handleOptionSelect = (group, option) => {
        setSelectedGroupOptions(prev => {
            const currentSelections = prev[group.id] || [];

            if (group.is_multiple) {
                const limit = Number(group.option_select);
                if (limit > 0 && currentSelections.length >= limit) {
                    addAlert({
                        title: "Accion no permitida.",
                        subtitle: `Has alcanzado el límite de ${limit} opciones para ${group.name}`,
                        type: "warning"
                    });
                    return prev;
                }
                const optionWithUniqueKey = { ...option, tempId: Date.now() + Math.random() };
                return { ...prev, [group.id]: [...currentSelections, optionWithUniqueKey] };
            } else {
                return { ...prev, [group.id]: option };
            }
        });
    };

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

    const getOptionGroupSelected = (group) => {
        if (group.is_multiple) {
            return selectedGroupOptions[group.id]?.length;
        }
        else if (!group.is_multiple && selectedGroupOptions[group.id] != undefined) {
            return 1;
        }
        return 0;
    };

    return (
        <>
            <div style={{ opacity: product?.available ? 1 : 0.5, pointerEvents: product?.available ? 'auto' : 'none' }}>
                {listOptionsProduct.map((group) => (
                    <div key={group.id} className="mb-4">
                        <h6 className="fw-bold d-flex justify-content-between align-items-center mb-3 text-brand-dark">
                            {group.name}{group.is_multiple == true ? ' (Múltiple)' : ' (Única)'}
                            {group.option_select > 0 && (
                                <span className="badge rounded-pill bg-brand-secondary text-brand-white">
                                    {(getOptionGroupSelected(group))} / {group.option_select}
                                </span>
                            )}
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                            {group.options.map((option) => {
                                const count = getOptionCount(group.id, option.id);
                                const limitReached = group.is_multiple && group.option_select > 0 && (selectedGroupOptions[group.id]?.length >= group.option_select);

                                // 1. Definimos la condición de visibilidad
                                //const isVisible = !group.is_multiple || (group.is_multiple && selectedGroupOptions[group.id]?.length == group.option_select);
                                const isVisible = selectedGroupOptions.length == 0 || (group.is_multiple && selectedGroupOptions[group.id]?.length == group.option_select) || (!group.is_multiple && selectedGroupOptions[group.id] != undefined);
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
                                        disabled={!product?.available || (limitReached && !(!group.is_multiple && count > 0))}
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
                    <p className="fw-bold mb-3">Productos añadidos:</p>

                    {listOptionsProduct.map(group => {
                        const selection = selectedGroupOptions[group.id];

                        // Si no hay selección para este grupo, no pintamos nada
                        if (!selection || (Array.isArray(selection) && selection.length === 0)) {
                            return null;
                        }

                        const items = Array.isArray(selection) ? selection : [selection];

                        return (
                            <div key={group.id} className="mb-4"> {/* Separación inferior entre grupos */}

                                {/* Título del grupo */}
                                <p className="text-secondary fw-semibold mb-1 small text-uppercase">
                                    {group.name}
                                </p>

                                {/* Contenedor de lista único para los elementos de este grupo */}
                                <div className="list-group shadow-sm">
                                    {items.map((opt, idx) => (
                                        <div key={opt.tempId || idx} className="list-group-item d-flex justify-content-between align-items-center py-2">
                                            <div>
                                                <span className="fw-bold text-primary me-2">•</span>
                                                {opt.name}
                                                {/* El <small> con el nombre del grupo ha sido eliminado para no ser redundante */}
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                {opt.add_price > 0 && (
                                                    <span className="small">+{Number(opt.add_price).toFixed(2)}€</span>
                                                )}
                                                {product?.available && (
                                                    <BsXCircleFill
                                                        className="text-danger fs-5"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => removeOneInstance(group.id, opt.tempId)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};


export default OptionsProductSelect;