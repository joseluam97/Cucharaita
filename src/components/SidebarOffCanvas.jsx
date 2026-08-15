import React, { useState, useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaCalendarAlt, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone, FaCheckCircle } from "react-icons/fa";

// --- IMPORTACIONES DEL CALENDARIO Y EL IDIOMA ---
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";

import useCartStore from "../store/cartStore";
import useOffcanvasStore from "../store/offcanvasStore";
import fetchDiscount from "../hooks/useDisconts";
import useBlockedDays from "../hooks/useBlockedDays";

// Importamos las nuevas funciones desde tu hook centralizado
import { createOrder, createOrderProduct, createOrderOptionsBatch } from "../hooks/useOrders";

registerLocale("es", es);

const SidebarOffCanvas = () => {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();

  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const { data: listBlockDays } = useBlockedDays({});

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    address: ""
  });
  
  const [dateWarning, setDateWarning] = useState(null);

  useEffect(() => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponMessage("");
    setLoadingDiscount(false);
    if (cart.length === 0) setShowCheckoutModal(false);
  }, [cart]);

  const calculateSubtotal = () => {
    return cart.reduce((acc, p) => acc + p.price * p.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discountAmount);
  };

  const excludedIntervals = (listBlockDays || []).map(range => {
    return {
      start: new Date(`${range.start_day}T00:00:00`),
      end: new Date(`${range.end_day}T23:59:59`)
    };
  });

  const handleDateChange = (date) => {
    if (!date) {
      setCustomerData({ ...customerData, date: "" });
      setDateWarning(null);
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const selectedDateStr = `${year}-${month}-${day}`;

    setCustomerData({ ...customerData, date: selectedDateStr });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      setDateWarning("⚠️ Para pedidos con menos de 3 días de antelación, NO se garantiza la entrega inmediata. Consultaremos disponibilidad al recibir tu pedido.");
    } else {
      setDateWarning("✅ Fecha anotada. Te confirmaremos la disponibilidad.");
    }
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

      if (coupon == null || coupon.active === false) {
        setDiscountAmount(0);
        setCouponMessage(coupon == null ? "❌ Cupón no válido." : "❌ El cupón no se encuentra activo.");
        setLoadingDiscount(false);
        return;
      }
      if (Number(subtotal) < Number(coupon.min_amount)) {
        setDiscountAmount(0);
        setCouponMessage(`❌ Este cupón requiere un pedido de minimo ${coupon.min_amount}€.`);
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
    
    Object.entries(optionsObj).forEach(([groupName, val]) => {
      const optionsArray = Array.isArray(val) ? val : [val];
      optionsArray.forEach(opt => {
        if (!opt) return;
        if (!grouped[opt.name]) {
          grouped[opt.name] = { count: 0, add_price: opt.add_price || 0, group: groupName };
        }
        grouped[opt.name].count += 1;
      });
    });
    return grouped;
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault(); 
    setIsSubmittingOrder(true);
    const total = calculateTotal();

    try {
      // 1. Crear el Pedido Principal (Orders) usando el hook
      const orderData = await createOrder({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        delivery_place: customerData.address,
        delivery_date: customerData.date,
        amount: total,
        amount_paid: 0,
        order_status: "CREADO"
      });

      const orderId = orderData.id;

      // 2. Iterar sobre el carrito para crear los productos y sus Opciones
      for (const product of cart) {
        for (let i = 0; i < product.quantity; i++) {
          
          // 2.1 Insertar el producto usando el hook
          const productData = await createOrderProduct({
            order: orderId,
            name: product.name,
            price: product.price,
            units: product.quantity
          });

          const orderProductId = productData.id;

          // 2.2 Insertar las opciones agrupadas (usando el campo 'units')
          const groupedOptions = groupProductOptions(product.options);
          const optionsToInsert = Object.entries(groupedOptions).map(([optName, data]) => ({
            product: orderProductId,
            group: data.group, 
            option: optName,
            extra_price: data.add_price,
            units: data.count 
          }));

          // 2.3 Inserción masiva de opciones usando el hook
          if (optionsToInsert.length > 0) {
            await createOrderOptionsBatch(optionsToInsert);
          }
        }
      }

      alert("✅ ¡Pedido realizado con éxito! Nos pondremos en contacto contigo pronto.");
      if (clearCart) clearCart(); 
      setShowCheckoutModal(false);
      toggleOffcanvas();

    } catch (error) {
      console.error("Error procesando el pedido:", error);
      alert("❌ Ocurrió un error al procesar tu pedido. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const renderGroupedOptionsUI = (productCart) => {
    const grouped = groupProductOptions(productCart.options);
    const options = Object.entries(grouped);
    
    if (options.length === 0) return null;

    return (
      <div className="mt-1 ps-2 border-start border-2">
        {options.map(([name, data], index) => {
            const totalOptionPrice = (data.count * data.add_price).toFixed(2);
            return (
                <div className="text-muted small lh-sm" key={`${productCart.id}-${index}`} style={{ fontSize: '0.75rem' }}>
                    {data.count > 1 && <span className="fw-bold text-dark">{data.count}x </span>}
                    {name}
                    {data.add_price > 0 && <span className="ms-1">(= {totalOptionPrice} €)</span>}
                </div>
            );
        })}
      </div>
    );
  };

  const isFormValid = customerData.name && customerData.email && customerData.phone && customerData.date && customerData.address;

  const renderCheckoutModal = () => {
    if (!showCheckoutModal) return null;
    const total = calculateTotal();
    const deposit = total * 0.25;
    const remaining = total * 0.75;
    const selectedDateObj = customerData.date ? new Date(`${customerData.date}T12:00:00`) : null;

    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
        <div className="bg-white rounded p-4 shadow-lg" style={{ maxWidth: '450px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Confirmar Datos del Pedido</h5>
            <button className="btn-close" onClick={() => setShowCheckoutModal(false)} disabled={isSubmittingOrder}></button>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold mb-1"><FaUser className="me-1 text-muted" /> Nombre Completo</label>
            <input type="text" className="form-control form-control-sm" value={customerData.name} onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })} disabled={isSubmittingOrder} />
          </div>

          <div className="row">
            <div className="col-6 mb-3">
              <label className="form-label small fw-bold mb-1"><FaEnvelope className="me-1 text-muted" /> Email</label>
              <input type="email" className="form-control form-control-sm" value={customerData.email} onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })} disabled={isSubmittingOrder} />
            </div>
            <div className="col-6 mb-3">
              <label className="form-label small fw-bold mb-1"><FaPhone className="me-1 text-muted" /> Teléfono</label>
              <input type="tel" className="form-control form-control-sm" value={customerData.phone} onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })} disabled={isSubmittingOrder} />
            </div>
          </div>

          <div className="mb-3 d-flex flex-column">
            <label className="form-label small fw-bold mb-1"><FaCalendarAlt className="me-1 text-muted" /> Fecha de Entrega</label>
            <DatePicker selected={selectedDateObj} onChange={handleDateChange} minDate={new Date()} excludeDateIntervals={excludedIntervals} dateFormat="dd/MM/yyyy" locale="es" placeholderText="Selecciona una fecha" className="form-control form-control-sm w-100" wrapperClassName="w-100" disabled={isSubmittingOrder} />
            {dateWarning && <div className={`mt-1 fw-bold ${dateWarning.includes('✅') ? 'text-success' : 'text-warning'}`} style={{ fontSize: '0.7rem' }}>{dateWarning}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold mb-1"><FaMapMarkerAlt className="me-1 text-muted" /> Lugar de Entrega</label>
            <input type="text" className="form-control form-control-sm" value={customerData.address} onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })} disabled={isSubmittingOrder} />
          </div>

          <div className="bg-light p-3 rounded mb-3 border">
            <h6 className="fw-bold border-bottom pb-2 mb-2 small">Resumen de Pago</h6>
            <div className="d-flex justify-content-between small mb-2"><span>Total:</span><span className="fw-bold">{total.toFixed(2)} €</span></div>
            <div className="mb-2"><div className="d-flex justify-content-between text-primary small align-items-center"><span className="fw-bold">Señal para reservar (25%):</span><span className="fw-bold">{deposit.toFixed(2)} €</span></div><p className="m-0 text-muted fst-italic" style={{ fontSize: '0.75rem' }}>(Se abonará tras confirmación)</p></div>
            <div className="d-flex justify-content-between text-muted small pt-2 border-top"><span>Restante a la entrega (75%):</span><span>{remaining.toFixed(2)} €</span></div>
          </div>

          <div className="d-grid gap-2">
            <button type="button" className={`btn btn-success fw-bold py-2 ${!isFormValid || isSubmittingOrder ? 'disabled' : ''}`} onClick={handleConfirmOrder} disabled={!isFormValid || isSubmittingOrder}>
              {isSubmittingOrder ? (
                <span>Procesando...</span>
              ) : (
                <><FaCheckCircle className="me-2" size={18} /> PROCESAR PEDIDO</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
              <div className="d-flex align-items-start gap-3 mb-3 pb-3 border-bottom" key={`${product.id}-${index}`}>
                <div style={{ width: "70px", height: "70px", flexShrink: 0 }}>
                    <img src={product.image} className="img-fluid rounded border" alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start">
                        <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.2' }}>{product.name}</h6>
                        <span className="fw-bold text-nowrap ms-2">{(product.price * product.quantity).toFixed(2)}€</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-end mt-1">
                        <div>
                             <small className="text-muted fw-bold" style={{fontSize: '0.8rem'}}>Cant: {product.quantity}</small>
                             {renderGroupedOptionsUI(product)}
                        </div>
                        <button className="btn btn-link text-danger p-0 border-0" onClick={() => removeFromCart(product.cartItemId)} title="Eliminar producto">
                            <RiDeleteBin6Line size={18} />
                        </button>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="offcanvas-footer p-3 bg-light border-top">
          <div className="mb-3">
            <label className="small fw-bold mb-1">Cupón de descuento</label>
            <div className="input-group input-group-sm">
              <input type="text" className="form-control" placeholder="Código" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button className="btn btn-dark" onClick={applyCoupon} disabled={loadingDiscount}>{loadingDiscount ? '...' : 'Aplicar'}</button>
            </div>
            {couponMessage && <div className={`x-small mt-1 fw-bold ${discountAmount > 0 ? 'text-success' : 'text-danger'}`}>{couponMessage}</div>}
          </div>

          {discountAmount > 0 && (
            <div className="d-flex justify-content-between mb-1 text-danger fw-bold"><span>Descuento:</span><span>-{discountAmount.toFixed(2)} €</span></div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">TOTAL:</h4>
            <h2 className="fw-bold mb-0">{calculateTotal().toFixed(2)} €</h2>
          </div>

          {cart.length > 0 && (
            <button className="btn btn-success w-100 fw-bold py-2 shadow-sm" onClick={() => setShowCheckoutModal(true)}>
              CONTINUAR PEDIDO
            </button>
          )}
        </div>
      </div>
      {renderCheckoutModal()}
    </>
  );
};

export default SidebarOffCanvas;