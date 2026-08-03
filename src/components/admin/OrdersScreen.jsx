const OrdersScreen = () => {
  // Datos de ejemplo: luego aquí harás tu fetch a Supabase
  const orders = [
    { id: 101, client: "Lucía Morales", total: "24.50", status: "Pendiente" },
    { id: 102, client: "Juan Pérez", total: "18.00", status: "Entregado" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-6">Gestión de Pedidos</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-brand-light overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-brand-cream/50">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Total</th>
              <th className="p-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-brand-light">
                <td className="p-4 font-bold">#{order.id}</td>
                <td className="p-4">{order.client}</td>
                <td className="p-4">{order.total} €</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pendiente' ? 'bg-brand-accent text-brand-primary' : 'bg-green-100 text-green-700'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersScreen;