import React, { useState, useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaWhatsapp, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaInfoCircle } from "react-icons/fa";
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

  // --- NUEVOS ESTADOS PARA EL MODAL Y EL FORMULARIO ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    date: "",
    address: ""
  });
  const [dateWarning, setDateWarning] = useState(null); // Para el mensaje de disponibilidad

  useEffect(() => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponMessage("");
    setLoadingDiscount(false);
    // Resetear modal al cambiar el carrito
    if (cart.length === 0) setShowCheckoutModal(false);
  }, [cart]);

  const calculateSubtotal = () => {
    return cart.reduce((acc, p) => acc + p.price * p.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount);
  };

  // --- LÓGICA DE FECHAS ---
  const handleDateChange = (e) => {
    const selectedDateStr = e.target.value;
    setCustomerData({ ...customerData, date: selectedDateStr });

    if (!selectedDateStr) {
      setDateWarning(null);
      return;
    }

    const selectedDate = new Date(selectedDateStr);
    const today = new Date();
    // Quitamos la hora para comparar solo fechas
    today.setHours(0, 0, 0, 0);

    // Calculamos diferencia en días
    const diffTime = selectedDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      setDateWarning("❌ No puedes seleccionar una fecha pasada.");
    } else if (diffDays < 3) {
      setDateWarning("⚠️ Para pedidos con menos de 3 días de antelación, NO se garantiza la entrega inmediata. Consultaremos disponibilidad al recibir tu pedido.");
    } else {
      setDateWarning("✅ Fecha válida. Entrega garantizada.");
    }
  };

  // --- LÓGICA DEL CUPÓN (Igual que antes) ---
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

      if (coupon == null) {
        setDiscountAmount(0);
        setCouponMessage("❌ Cupón no válido.");
        setLoadingDiscount(false);
        return;
      }
      if (coupon.active === false) {
        setDiscountAmount(0);
        setCouponMessage("❌ El cupón no se encuentra activo.");
        setLoadingDiscount(false);
        return;
      }
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

  // --- GENERAR EL MENSAJE FINAL ---
  const generateWhatsAppMessage = () => {
    const total = calculateTotal();
    const deposit = total * 0.25;
    const remaining = total * 0.75;

    let message = `Hola Cucharaita, me gustaría realizar el siguiente pedido: \n\n*🛒 RESUMEN DEL PEDIDO:*`;

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
      message += `\n*Descuento aplicado (${couponCode}): -${discountAmount.toFixed(2)} €*`;
    }

    message += `\n\n*💰 TOTAL A PAGAR: ${total.toFixed(2)} €*`;

    // Información del cliente añadida
    message += `\n----------------------------------`;
    message += `\n*👤 DATOS DE ENTREGA:*`;
    message += `\nNombre: ${customerData.name}`;
    message += `\nFecha solicitada: ${customerData.date} ${dateWarning && dateWarning.includes("NO se garantiza") ? "(Consultar Disponibilidad)" : ""}`;
    message += `\nLugar: ${customerData.address}`;

    message += `\n----------------------------------`;
    message += `\n*ℹ️ CONDICIONES DE PAGO:*`;
    message += `\nSe requiere abonar el 25% para confirmar: *${deposit.toFixed(2)} €*`;
    message += `\nRestante a la entrega: *${remaining.toFixed(2)} €*`;

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

  const handleOpenCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
  };

  const isFormValid = customerData.name && customerData.date && customerData.address;

  // --- RENDERIZADO DEL MODAL ---
  // --- RENDERIZADO DEL MODAL (VERSIÓN SIMPLIFICADA) ---
  const renderCheckoutModal = () => {
    if (!showCheckoutModal) return null;
    const total = calculateTotal();
    const deposit = total * 0.25;
    const remaining = total * 0.75;

    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
        <div className="bg-white rounded p-4 shadow-lg" style={{ maxWidth: '450px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Confirmar Datos del Pedido</h5>
            <button className="btn-close" onClick={handleCloseCheckout}></button>
          </div>

          {/* (Eliminada la alerta azul superior) */}

          {/* Formulario más compacto */}
          <div className="mb-3">
            <label className="form-label small fw-bold mb-1"><FaUser className="me-1 text-muted" /> Nombre Completo</label>
            <input
              type="text"
              className="form-control form-control-sm" // Usamos input-sm para reducir altura
              value={customerData.name}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold mb-1"><FaCalendarAlt className="me-1 text-muted" /> Fecha de Entrega</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={customerData.date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
            />
            {dateWarning && (
              <div 
                className={`mt-1 fw-bold ${dateWarning.includes('✅') ? 'text-success' : 'text-warning'}`}
                style={{ fontSize: '0.7rem' }} 
              >
                {dateWarning}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold mb-1"><FaMapMarkerAlt className="me-1 text-muted" /> Lugar de Entrega</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={customerData.address}
              onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
            />
          </div>

          {/* Resumen de Pagos SIMPLIFICADO */}
          <div className="bg-light p-3 rounded mb-3 border">
            <h6 className="fw-bold border-bottom pb-2 mb-2 small">Resumen de Pago</h6>

            <div className="d-flex justify-content-between small mb-2">
              <span>Total:</span>
              <span className="fw-bold">{total.toFixed(2)} €</span>
            </div>

            {/* Sección del 25% simplificada y directa */}
            <div className="mb-2">
              <div className="d-flex justify-content-between text-primary small align-items-center">
                <span className="fw-bold">Señal para reservar (25%):</span>
                <span className="fw-bold">{deposit.toFixed(2)} €</span>
              </div>
              {/* Texto sutil en lugar de alerta amarilla */}
              <p className="m-0 text-muted fst-italic" style={{ fontSize: '0.75rem' }}>
                (Se abonará por Bizum/Transferencia tras recibir instrucciones por WhatsApp)
              </p>
            </div>

            <div className="d-flex justify-content-between text-muted small pt-2 border-top">
              <span>Restante a la entrega (75%):</span>
              <span>{remaining.toFixed(2)} €</span>
            </div>
          </div>

          {/* Pie de foto abreviado */}
          <p className="text-muted x-small text-center mb-3">
            Se abrirá WhatsApp con el pedido listo para enviar.
          </p>

          <div className="d-grid gap-2">
            <a
              href={isFormValid ? `https://api.whatsapp.com/send?phone=+34685709031&text=${generateWhatsAppMessage()}` : "#"}
              className={`btn btn-success fw-bold py-2 ${!isFormValid ? 'disabled' : ''}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => isFormValid && setShowCheckoutModal(false)}
            >
              <FaWhatsapp className="me-2" size={20} /> ENVIAR PEDIDO
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* OffCanvas Original */}
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

        <div className="offcanvas-footer p-3 bg-light border-top">
          {/* ... (Sección del cupón igual que antes) ... */}
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
            // CAMBIO: Ahora este botón abre el modal, no envía a WhatsApp directamente
            <button
              className="btn btn-success w-100 fw-bold py-2 shadow-sm"
              onClick={handleOpenCheckout}
            >
              CONTINUAR PEDIDO
            </button>
          )}
        </div>
      </div>

      {/* RENDERIZAR EL MODAL SI ESTÁ ACTIVO */}
      {renderCheckoutModal()}
    </>
  );
};

export default SidebarOffCanvas;