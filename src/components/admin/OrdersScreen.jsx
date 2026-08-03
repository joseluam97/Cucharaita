import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableReusable from '../TableReusable';
import { getAllOrders, updateOrderStatus } from '../../hooks/useOrders';
import { BsEye, BsPencil } from 'react-icons/bs';

const ORDER_STATUSES = [
  "CREADO",
  "REVISADO",
  "PENDIENTE DE RECIBIR PRIMER PAGO",
  "PEDIDO PAGADO",
  "EN PREPARACION",
  "ENVIADO",
  "FINALIZADO"
];

// Función auxiliar para colorear estados
const getStatusColor = (status) => {
  switch (status) {
    case "CREADO": return "bg-slate-100 text-slate-600 border-slate-200";
    case "REVISADO": return "bg-blue-50 text-blue-600 border-blue-200";
    case "PENDIENTE DE RECIBIR PRIMER PAGO": return "bg-orange-50 text-orange-600 border-orange-200";
    case "PEDIDO PAGADO": return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "EN PREPARACION": return "bg-purple-50 text-purple-600 border-purple-200";
    case "ENVIADO": return "bg-teal-50 text-teal-600 border-teal-200";
    case "FINALIZADO": return "bg-green-100 text-green-700 border-green-300";
    default: return "bg-slate-50 text-slate-500 border-slate-200";
  }
};

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      // Mapeamos para pre-calcular el total de productos para la tabla
      const formattedData = data.map(order => ({
        ...order,
        productsCount: order.Orders_Product ? order.Orders_Product.length : 0
      }));
      setOrders(formattedData);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Actualizamos el estado local para reflejar el cambio inmediato sin recargar toda la base de datos
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === orderId ? { ...order, order_status: newStatus } : order)
      );
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("No se pudo actualizar el estado.");
    }
  };

  const columns = [
    {
      header: 'ID / Fecha',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-brand-dark">#{row.id}</span>
          <span className="text-xs text-slate-500">
            {new Date(row.created_at).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: 'Cliente',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{row.name}</span>
          <span className="text-xs text-slate-500">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Importe',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800">{row.amount}€</span>
          <span className="text-[10px] text-slate-500">Pagado: {row.amount_paid || 0}€</span>
        </div>
      )
    },
    {
      header: 'Productos',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
          {row.productsCount}
        </span>
      )
    },
    {
      header: 'Estado Rápido',
      render: (row) => (
        <select
          value={row.order_status || "CREADO"}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`text-[11px] font-bold uppercase tracking-wider p-2 rounded-lg border outline-none cursor-pointer transition-colors ${getStatusColor(row.order_status)}`}
        >
          {ORDER_STATUSES.map(status => (
            <option key={status} value={status} className="bg-white text-slate-800">
              {status}
            </option>
          ))}
        </select>
      )
    }
  ];

  const handleView = (order) => navigate(`/administration/orders/${order.id}`);
  const handleEdit = (order) => navigate(`/administration/orders/${order.id}/edit`);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-light">
        <h1 className="text-2xl font-bold text-brand-dark mb-1">Gestión de Pedidos</h1>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-light flex justify-center items-center">
          <div className="text-brand-primary font-bold animate-pulse">Cargando pedidos...</div>
        </div>
      ) : (
        <TableReusable
          columns={columns}
          data={orders}
          onView={handleView}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default OrdersScreen;