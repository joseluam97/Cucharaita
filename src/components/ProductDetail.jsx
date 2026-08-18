import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import useProducts from "../hooks/useProducts";
import useCartStore from "../store/cartStore";
import { BsDashCircle, BsPlusCircle, BsXCircleFill, BsSlashCircle, BsBagCheckFill } from "react-icons/bs";
import { Base64 } from 'js-base64';
import useGroups from "../hooks/useGroups";
import { getGroupOptionsByGroup } from "../hooks/useOptions";
import OptionsProductSelect from "./OptionsProductSelect";

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

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

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
                    <OptionsProductSelect
                        productId={productId}
                        quantity={quantity}
                        selectedGroupOptions={selectedGroupOptions}
                        setSelectedGroupOptions={setSelectedGroupOptions}
                        setPrecioWithAdd={setPrecioWithAdd}
                        setCanAddToCart={setCanAddToCart}
                    />
                    
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