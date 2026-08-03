import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const baseClasses = "group flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 no-underline text-sm";
  
  const getNavLinkClass = ({ isActive }) => 
    `${baseClasses} ${isActive 
      ? 'bg-brand-accent text-black shadow-lg' 
      : 'text-brand-white hover:bg-white/10 hover:translate-x-1'}`;

  // Definición de las rutas para facilitar el mantenimiento
  const menuItems = [
    { name: "Productos", path: "/administration/productos", icon: "🍪" },
    { name: "Grupos", path: "/administration/option-group", icon: "🧩" },
    { name: "Opciones", path: "/administration/option", icon: "⚙️" },
    { name: "Pedidos", path: "/administration/pedidos", icon: "📦" },
    { name: "Tags", path: "/administration/tags", icon: "🏷️" },
    { name: "Tipos", path: "/administration/tipos", icon: "📂" },
    { name: "Descuentos", path: "/administration/descuentos", icon: "🏷️" },
    { name: "Calendario", path: "/administration/calendario", icon: "📅" },
    { name: "Accesos", path: "/administration/accesos", icon: "📊" },
    { name: "Usuarios", path: "/administration/usuarios", icon: "👥" },
    { name: "Estado Web", path: "/administration/estado", icon: "🌐" },
  ];

  return (
    <div className="flex min-h-screen bg-brand-cream/20">
      {/* Sidebar - ahora con scroll interno si hay muchas opciones */}
      <aside className="w-72 bg-brand-primary text-white p-6 shadow-2xl flex flex-col h-screen sticky top-0">
        <h2 className="text-2xl font-cooper mb-8 px-2 text-white">Panel Cucharaita</h2>
        
        <nav className="flex flex-col gap-1 overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={getNavLinkClass}>
              <span className="text-lg">{item.icon}</span> 
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;