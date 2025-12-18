import React, { useState, useEffect, useCallback } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import useCartStore from "../store/cartStore";
import useOffcanvasStore from "../store/offcanvasStore";
import fetchDiscount from "../hooks/useDisconts";

const SidebarOffCanvas = () => {
  const { cart, removeFromCart } = useCartStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [loadingDiscount, setLoadingDiscount] = useState(false);


  useEffect(() => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponMessage("");
    setLoadingDiscount(false);
  }, [cart]);

  const calculateSubtotal = () => {
    return cart.reduce((acc, p) => acc + p.price * p.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount);
  };

  const applyCoupon = async () => {
    const code = couponCode.toUpperCase();
    const subtotal = calculateSubtotal();
    if (!code) {
      setCouponMessage("Introduce un código.");
      return;
    }
    setLoadingDiscount(true);
    try {
      const { data: discountData, error: discountError } = await fetchDiscount(code);
      if (discountError) throw new Error();
      const coupon = discountData?.[0];
      console.log(subtotal);
      console.log(coupon.min_amount);
      console.log(Number(subtotal) >= Number(coupon.min_amount));

      // Ilegal Condition(1): Coupon must exist
      if (coupon == null) {
        setDiscountAmount(0);
        setCouponMessage("❌ Cupón no válido.");
        setLoadingDiscount(false);
        return;
      }
      // Ilegal Condition(2): Coupon not active
      if (coupon.active == false) {
        setDiscountAmount(0);
        setCouponMessage("❌ El cupón no se encuentra activo.");
        setLoadingDiscount(false);
        return;
      }
      // Ilegal Condition(3): Subtotal must be equal or greater than min_amount
      if (Number(subtotal) < Number(coupon.min_amount)) {
        setDiscountAmount(0);
        setCouponMessage("❌ Este cupón requiere un pedido de minimo " + coupon.min_amount + "€.");
        setLoadingDiscount(false);
        return;
      }

      let discount = coupon.type === "PERCENTAGE" ? subtotal * (coupon.import / 100) : coupon.import;
      setDiscountAmount(discount);
      setCouponMessage(`✅ Cupón aplicado: -${discount.toFixed(2)}€`);

    } catch (e) {
      setCouponMessage("Error al validar cupón.");
    } finally {
      setLoadingDiscount(false);
    }
  };

  const groupProductOptions = (optionsObj) => {
    const grouped = {};
    if (!optionsObj) return grouped;
    Object.values(optionsObj).forEach((val) => {
      const optionsArray = Array.isArray(val) ? val : [val];
      optionsArray.forEach(opt => {
        if (!opt) return;
        if (!grouped[opt.name]) {
          grouped[opt.name] = { count: 0, add_price: opt.add_price || 0 };
        }
        grouped[opt.name].count += 1;
      });
    });
    return grouped;
  };

  const generateWhatsAppMessage = () => {
    let message = "Hola Cucharaita, saludos. \n\n*Listado de productos:*";
    cart.forEach((product) => {
      message += `\n● *${product.name}* x${product.quantity}: *${(product.price * product.quantity).toFixed(2)}€*\n`;
      const grouped = groupProductOptions(product.options);
      Object.entries(grouped).forEach(([name, data]) => {
        const totalOptionPrice = (data.count * data.add_price).toFixed(2);
        const priceText = data.add_price > 0 ? ` (=${totalOptionPrice} €)` : "";
        message += `   └ ${data.count > 1 ? `${data.count}x ` : ""}${name}${priceText}\n`;
      });
    });
    if (discountAmount > 0) {
      message += `\n*Descuento aplicado(${couponCode}): -${discountAmount.toFixed(2)} €*`;
    }
    message += `\n\n*Total a pagar: ${calculateTotal().toFixed(2)} €*`;
    return encodeURIComponent(message);
  };

  const renderGroupedOptionsUI = (productCart) => {
    const grouped = groupProductOptions(productCart.options);
    return Object.entries(grouped).map(([name, data], index) => {
      const totalOptionPrice = (data.count * data.add_price).toFixed(2);
      return (
        <p className="mb-0 detalles-product text-muted small" key={`${productCart.id}-${index}`}>
          • {data.count > 1 && <strong>{data.count}x </strong>}
          {name}
          {data.add_price > 0 && <span className="ms-1">(= {totalOptionPrice} €)</span>}
        </p>
      );
    });
  };

  return (
    <div className={`offcanvas offcanvas-end ${isVisible ? "show offcanvas-open" : ""}`} tabIndex="-1">
      <div className="offcanvas-header border-bottom">
        <h5 className="fw-bold mb-0">MI CARRITO</h5>
        <button type="button" className="btn-close" onClick={toggleOffcanvas}></button>
      </div>

      <div className="offcanvas-body">
        {cart.length === 0 ? (
          <p className="text-center mt-5">Tu carrito está vacío.</p>
        ) : (
          cart.map((product, index) => (
            <div className="row mb-3 pb-3 border-bottom align-items-center" key={`${product.id}-${index}`}>
              <div className="col-2">
                <img src={product.image} className="img-fluid rounded" alt={product.name} />
              </div>
              <div className="col-7">
                <h6 className="fw-bold mb-1">{product.name}</h6>
                {renderGroupedOptionsUI(product)}
              </div>
              <div className="col-3 text-end">
                <div className="small text-muted">{product.quantity}x</div>
                <div className="fw-bold">{(product.price * product.quantity).toFixed(2)}€</div>
                <button className="btn btn-sm text-danger p-0 mt-2" onClick={() => removeFromCart(product.cartItemId)}>
                  <RiDeleteBin6Line />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🛑 PIE DEL CARRITO (SIEMPRE VISIBLE) */}
      <div className="offcanvas-footer p-3 bg-light border-top">
        {/* SECCIÓN DE CUPÓN FIJA ABAJO */}
        <div className="mb-3">
          <label className="small fw-bold mb-1">Cupón de descuento</label>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button className="btn btn-dark" onClick={applyCoupon} disabled={loadingDiscount}>
              {loadingDiscount ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponMessage && <div className={`x-small mt-1 fw-bold ${discountAmount > 0 ? 'text-success' : 'text-danger'}`}>{couponMessage}</div>}
        </div>

        {/* RESUMEN DE PRECIOS */}
        {discountAmount > 0 && (
          <div className="d-flex justify-content-between mb-1 text-danger fw-bold">
            <span>Descuento:</span>
            <span>-{discountAmount.toFixed(2)} €</span>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">TOTAL:</h4>
          <h2 className="fw-bold mb-0">{calculateTotal().toFixed(2)} €</h2>
        </div>

        {cart.length > 0 && (
          <a href={`https://api.whatsapp.com/send?phone=+34685709031&text=${generateWhatsAppMessage()}`} className="btn btn-success w-100 fw-bold py-2 shadow-sm" target="_blank" rel="noreferrer">
            <FaWhatsapp className="me-2" size={20} /> ENVIAR PEDIDO
          </a>
        )}
      </div>
    </div>
  );
};

export default SidebarOffCanvas;