import React, { useState } from "react"; // 👈 Importar useState
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaWhatsapp } from "react-icons/fa";
import useCartStore from "../store/cartStore";
import useOffcanvasStore from "../store/offcanvasStore";
import fetchDiscount from "../hooks/useDisconts";

const SidebarOffCanvas = () => {
  // Acceder al store de cart y usar sus funciones
  const { cart, removeFromCart } = useCartStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();

  // 1. ESTADO PARA CUPÓN
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [loadingDiscount, setLoadingDiscount] = useState(false);

  // BBDD simple de cupones de descuento (simulación)
  const availableCoupons = {
    "WELCOME10": { type: "percentage", value: 10, min: 20 }, // 10% de descuento, mínimo 20€
    "FREE5": { type: "fixed", value: 5, min: 30 }, // 5€ de descuento fijo, mínimo 30€
  };

  // Calcula el subtotal
  const calculateSubtotal = () => {
    return cart.reduce((acc, p) => acc + p.price * p.quantity, 0);
  };

  // Calcula el total con descuento aplicado
  const calculateTotal = () => {
    const subtotal = calculateSubtotal() - discountAmount;
    return Math.max(0, subtotal - discountAmount); // Asegura que el total no sea negativo
  };

  // 2. LÓGICA PARA APLICAR CUPÓN
  const applyCoupon = async () => { // 👈 Marcar como ASYNC
    const code = couponCode.toUpperCase();
    const subtotal = calculateSubtotal();

    if (!code) {
      setCouponMessage("Introduce un código de cupón.");
      setDiscountAmount(0);
      return;
    }

    setLoadingDiscount(true);
    setCouponMessage("Buscando cupón...");
    setDiscountAmount(0);

    try {
      // 🛑 LLAMADA DIRECTA A LA FUNCIÓN ASÍNCRONA (CORRECTO)
      const { data: discountData, error: discountError } = await fetchDiscount(code);

      if (discountError) {
        setCouponMessage("Error de conexión al servidor.");
        return;
      }

      // Supongamos que la respuesta es un array, y solo nos importa el primer resultado
      const coupon = discountData && discountData.length > 0 ? discountData[0] : null;

      if (coupon) {
        // CUPÓN ENCONTRADO
        if (subtotal < coupon.min_amount) { // Ajusta 'min_amount' al nombre de tu columna
          setCouponMessage(`Mínimo de compra de ${coupon.min_amount} € requerido.`);
          return;
        }

        let discount = 0;
        if (coupon.type === "PERCENTAGE") {
          discount = subtotal * (coupon.import / 100);
        } else if (coupon.type === "IMPORT") {
          discount = coupon.import;
        }

        setDiscountAmount(discount);
        setCouponMessage(`✅ Cupón aplicado: ${code}. Descuento de ${discount.toFixed(2)} €.`);

      } else {
        // CUPÓN NO ENCONTRADO
        setCouponMessage("❌ Cupón no válido.");
      }

    } catch (e) {
      setCouponMessage("Ocurrió un error inesperado.");
      console.error(e);
    } finally {
      setLoadingDiscount(false);
    }
  };

  // 3. GENERADOR DE MENSAJE DE WHATSAPP (Actualizado con Total)
  const generateWhatsAppMessage = () => {
    let message = "Hola Cucharaita, saludos. \n\nListado de productos:\n";

    // Lista de productos
    cart.forEach((product) => {
      const optionText = product.selectedOption ? ` (${product.selectedOption})` : "";
      message += `● ${product.name}${optionText} x${product.quantity}: *${(product.price * product.quantity).toFixed(2)}€*\n`;
    });

    // Resumen de precios
    const subtotal = calculateSubtotal().toFixed(2);
    const total = calculateTotal().toFixed(2);

    message += `\n*Subtotal: ${subtotal} €*`;

    if (discountAmount > 0) {
      message += `\n*Descuento (${couponCode.toUpperCase()}): -${discountAmount.toFixed(2)} €*`;
    }

    message += `\n*Total a pagar: ${total} €*`;

    return encodeURIComponent(message);
  };

  return (
    <div
      className={`offcanvas offcanvas-end px-1 ${isVisible ? "show offcanvas-open" : ""
        }`}
      tabIndex="-1"
      id="offcanvasRight"
      aria-labelledby="offcanvasRightLabel"
    >
      <div className="offcanvas-header">
        <h5
          className="offcanvas-title text-uppercase text-center fw-bold"
          id="offcanvasRightLabel"
        >
          Mi carrito de compras
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={toggleOffcanvas}
          aria-label="Close"
        ></button>
      </div>

      <div className="offcanvas-body">
        {/* Contenido del carrito (productos) */}
        {cart.length === 0 ? (
          <p className="text-center mt-5">No hay productos en el carrito.</p>
        ) : (
          cart.map((productCart) => (
            <div
              className="row align-items-center mb-2 py-1"
              style={{ borderBottom: "1px dashed rgb(176, 176, 176)" }}
              key={productCart.id}
            >
              <div className="col-3">
                <img
                  src={productCart.image}
                  className="card-img-top border-radius-5"
                  alt={productCart.name}
                />
              </div>
              <div className="col-5">
                <h4 className="mb-0 title-product">{productCart.name}</h4>
                <p className="mb-2 detalles-product">
                  {productCart.selectedOption ? productCart.selectedOption : ""}
                </p>
              </div>
              <div className="col-4 text-end">
                <span className="fw-bold">
                  <span className="fs-6 color-gris">
                    {productCart.quantity}x
                  </span>
                  <strong className="fs-5 precio">{(productCart.price * productCart.quantity).toFixed(2)} €</strong>
                </span>
                <button
                  className="btn mt-3 delete-product"
                  onClick={() => removeFromCart(productCart.id)}
                >
                  <RiDeleteBin6Line />
                </button>
              </div>
            </div>
          ))
        )}

        {/* 4. NUEVO: SECCIÓN DE CUPÓN */}
        {cart.length > 0 && (
          <div className="mt-4 pt-3 border-top">
            <h5 className="mb-3 fw-bold">Aplicar Cupón</h5>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Código de cupón"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={loadingDiscount} // Deshabilitar mientras busca
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={applyCoupon}
                disabled={loadingDiscount} // Deshabilitar mientras busca
              >
                {loadingDiscount ? 'Cargando...' : 'Aplicar'}
              </button>
            </div>
            {couponMessage && (
              <p className={`small fw-bold ${discountAmount > 0 ? 'text-success' : 'text-danger'}`}>
                {couponMessage}
              </p>
            )}
          </div>
        )}
        {/* FIN SECCIÓN DE CUPÓN */}

      </div>

      <div className="offcanvas-footer mt-4 px-2">
        {/* Mostrar descuento si aplica */}
        {discountAmount > 0 && (
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h5 className="mb-0 fw-bold text-muted">Descuento:</h5>
            <span className="fw-bold fs-5 text-danger">
              - {discountAmount.toFixed(2)} €
            </span>
          </div>
        )}

        {/* SUBTOTAL (Revisado para claridad) */}
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">SUBTOTAL:</h5>
          <span className="fw-bold fs-2">
            {calculateTotal().toFixed(2)}
            <span style={{ color: "#ff9c08" }}> €</span>
          </span>
        </div>

        <p className="small text-muted text-end mt-0 mb-4">
          Precio sin incluir envío.
        </p>

        {cart.length > 0 && (
          <a
            href={`https://api.whatsapp.com/send?phone=+34685709031&text=${generateWhatsAppMessage()}`}
            className="btn btn-comprar w-100"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp /> &nbsp; Enviar pedido por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

export default SidebarOffCanvas;