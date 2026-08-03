import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { BsArrowLeft, BsSave, BsPerson, BsBoxSeam, BsListCheck } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { getOrderById, updateOrderDetails } from "../../hooks/useOrders";
import { InputField, LabelTitle } from "./CommonField"; 

const ORDER_STATUSES = [
  "CREADO", "REVISADO", "PENDIENTE DE RECIBIR PRIMER PAGO", 
  "PEDIDO PAGADO", "EN PREPARACION", "ENVIADO", "FINALIZADO"
];

const OrdersDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isEditMode = location.pathname.includes("/edit");

  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        setOrderData(data);
        
        // Poblamos el formulario
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          delivery_place: data.delivery_place || "",
          delivery_date: data.delivery_date || "",
          amount: data.amount || 0,
          amount_paid: data.amount_paid || 0,
          order_status: data.order_status || "CREADO",
        });
      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await updateOrderDetails(id, formData);
      alert("✅ Pedido actualizado correctamente.");
      // Actualizamos los datos locales para la vista
      setOrderData(prev => ({ ...prev, ...formData }));
      navigate(`/administration/orders/${id}`); // Volver a modo vista
    } catch (error) {
      console.error("Error guardando pedido:", error);
      alert("❌ Hubo un error al actualizar el pedido.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!orderData) return <div>Pedido no encontrado</div>;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* CABECERA */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/administration/orders")}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 text-slate-600 rounded-xl hover:bg-brand-primary hover:text-white transition-colors border border-slate-200"
          >
            <BsArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Pedido #{orderData.id}
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-md font-bold border border-brand-primary/20 uppercase">
                {formData.order_status}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isEditMode ? "Modo edición" : "Modo consulta (solo lectura)"}
            </p>
          </div>
        </div>

        {!isEditMode ? (
          <button
            onClick={() => navigate(`/administration/orders/${id}/edit`)}
            className="bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-md flex items-center gap-2"
          >
            <FaEdit size={16} /> Editar Pedido
          </button>
        ) : (
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <BsSave size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQ: DATOS DEL CLIENTE Y PEDIDO */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BsPerson className="text-brand-primary" /> Datos del Cliente y Envío
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombre" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Teléfono" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Fecha de Entrega" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Lugar de Entrega" name="delivery_place" value={formData.delivery_place} onChange={handleInputChange} disabled={!isEditMode} span={2} type="textarea" />
            </div>
          </div>

          {/* LISTADO DE PRODUCTOS DEL PEDIDO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BsListCheck className="text-brand-primary" /> Productos Solicitados ({orderData.Orders_Product?.length || 0})
            </h3>
            
            <div className="flex flex-col gap-3">
              {orderData.Orders_Product?.map((product) => (
                <div key={product.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{product.name}</span>
                    <span className="font-bold text-brand-primary">{product.price}€</span>
                  </div>
                  
                  {/* Opciones del producto */}
                  {product.Orders_Options && product.Orders_Options.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                      {product.Orders_Options.map((opt, index) => (
                        <span key={opt.id} className="text-[10px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-sm flex items-center gap-1">
                          <b className="text-slate-400">{index + 1}:</b> {opt.option}
                          ({opt.units} uds)
                          {opt.extra_price > 0 && <span className="text-green-600 font-bold ml-1">+{opt.extra_price}€</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DER: ESTADO FINANCIERO */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BsBoxSeam className="text-brand-primary" /> Estado y Cobros
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <LabelTitle title="Estado General" />
              <select
                name="order_status"
                value={formData.order_status}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-sm font-bold text-slate-800 disabled:opacity-60 cursor-pointer outline-none"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <InputField label="Total (€)" name="amount" type="number" value={formData.amount} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Pagado (€)" name="amount_paid" type="number" value={formData.amount_paid} onChange={handleInputChange} disabled={!isEditMode} />
            </div>

            {/* Calculadora visual de deuda */}
            <div className={`mt-2 p-3 rounded-xl border flex justify-between items-center ${formData.amount > formData.amount_paid ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <span className="text-xs font-bold text-slate-600">Restante:</span>
              <span className={`font-bold ${formData.amount > formData.amount_paid ? 'text-red-600' : 'text-green-600'}`}>
                {Math.max(0, formData.amount - formData.amount_paid).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrdersDetailAdmin;