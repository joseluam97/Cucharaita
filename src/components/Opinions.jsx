import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from 'react-router-dom'; 
import { BsStarFill, BsCheckCircleFill, BsSend } from "react-icons/bs";
import fetchRequestOpinions from "../hooks/useRequestOpinions";
import useOpinions from "../hooks/useOpinions";

const Opinions = () => {
  const navigate = useNavigate();
  const { code } = useParams(); 

  const [orderCode, setOrderCode] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitRatings, loading: isSaving } = useOpinions();

  useEffect(() => {
    if (code) {
      const normalizedCode = code.toUpperCase();
      setOrderCode(normalizedCode); // Actualiza el input visualmente
      // Pasamos el código DIRECTAMENTE para evitar esperar al estado
      handleValidateOrder(null, normalizedCode); 
    }
  }, [code]);

  // Modificamos la función para aceptar un segundo parámetro opcional (manualCode)
  const handleValidateOrder = async (e, manualCode = null) => {
    if (e) e.preventDefault(); 
    
    // TRUCO: Si viene manualCode úsalo, si no, usa el estado orderCode
    const codeToValidate = manualCode || orderCode;

    console.log("Validando código final:", codeToValidate); // Ahora sí verás el código

    if (!codeToValidate) return;

    setLoading(true);
    setError("");

    try {
      // Usamos codeToValidate en lugar de orderCode
      const { data: opinionsData, error: opinionsError } = await fetchRequestOpinions(codeToValidate.toUpperCase());

      if (opinionsData == null) {
        throw new Error("El código de pedido no existe.");
      }

      if (opinionsData.complete === true) {
        throw new Error("Este pedido ya ha sido valorado anteriormente.");
      }

      setOrderData(opinionsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (product, value) => {
    setRatings((prev) => ({
      ...prev,
      [product]: value,
    }));
  };

  const isFormComplete = useMemo(() => {
    if (!orderData) return false;
    return orderData.list_order.every((product) => ratings.hasOwnProperty(product));
  }, [orderData, ratings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submitRatings(orderData.name_code, ratings);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      alert("Hubo un error al guardar: " + result.message);
    }
  };

  if (isSubmitted) {
    return (
        <div className="container mt-5 text-center">
            <BsCheckCircleFill className="text-success display-1 mb-3" />
            <p>¡Gracias por tu opinión!</p>
            <p>Tus valoraciones nos ayudan a mejorar cada día.</p>
            <h4>Tu opinión cuenta y te lo agradecemos con este codigo de descuento: </h4>
            <h3>OP-{orderCode}</h3>
            <p>10% de descuento, valido para compras superiores a 20€</p>
            <button className="btn btn-dark mt-3" onClick={() => navigate('/')}>Volver</button>
        </div>
    );
  }

  if (orderData) {
    return (
      <div className="container mt-4 mb-5" style={{ maxWidth: "600px" }}>
         <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
             <div className="bg-dark text-white p-4 text-center">
                <h3 className="mb-1">Valorar Pedido</h3>
                <span className="badge bg-warning text-dark">{orderData.name_code}</span>
             </div>
             <div className="card-body p-4">
                 <p className="text-muted text-center mb-4">Puntúa cada producto del 0 al 10 según tu experiencia.</p>
                 {orderData.list_order.map((product, index) => (
                    <div key={index} className="mb-4 pb-3 border-bottom">
                       <label className="fw-bold mb-2 d-block">{product}</label>
                       <div className="d-flex flex-wrap gap-1 justify-content-between">
                         {[...Array(11).keys()].map((num) => (
                           <button
                             key={num}
                             type="button"
                             className={`btn btn-sm rounded-circle ${ratings[product] === num ? 'btn-warning' : 'btn-outline-secondary'}`}
                             style={{ width: "35px", height: "35px", fontSize: "0.75rem", padding: 0 }}
                             onClick={() => handleRatingChange(product, num)}
                           >
                             {num}
                           </button>
                         ))}
                       </div>
                    </div>
                 ))}
                 
                 <button
                    className="btn btn-dark w-100 btn-lg rounded-pill mt-3"
                    disabled={!isFormComplete || isSaving}
                    onClick={handleSubmit}
                 >
                    {isSaving ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                        <> <BsSend /> Enviar Valoraciones </>
                    )}
                 </button>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold">Tu Opinión Cuenta 🍪</h2>
        <p className="text-muted">Introduce el código de tu pedido para comenzar.</p>
      </div>

      <form onSubmit={handleValidateOrder} className="card p-4 shadow-sm border-0 rounded-4">
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-lg text-center"
            placeholder="NOMBRE0X"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
            required
          />
        </div>

        {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}

        <button
          type="submit"
          className="btn btn-warning w-100 fw-bold py-2 rounded-pill"
          disabled={loading || !orderCode}
        >
          {loading ? "Validando..." : "Validar Pedido"}
        </button>
      </form>
    </div>
  );
};

export default Opinions;