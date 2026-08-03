// src/screens/ProductsScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableReusable from '../TableReusable';
import { fetchAllAdminProducts, logicalDeleteProduct } from '../../hooks/useProducts';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Carga de datos usando la función pura
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdminProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Configuración de columnas para la tabla reutilizable
  const productColumns = [
    {
      header: 'Producto',
      render: (row) => (
        <div className="flex items-center gap-4">
          {row.image ? (
            /* Contenedor estricto a prueba de desbordamientos en tablas */
            <div className="relative w-12 h-12 min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-xl border border-brand-light shadow-sm flex-shrink-0 overflow-hidden bg-brand-cream">
              <img
                src={row.image}
                alt={row.name}
                /* absolute inset-0 obliga a la imagen a pegarse a los bordes de su padre sin empujar la tabla */
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-brand-cream rounded-xl flex items-center justify-center text-[10px] text-brand-dark font-bold border border-brand-light text-center leading-tight">
              Sin foto
            </div>
          )}
          <span className="font-bold text-brand-dark whitespace-nowrap">{row.name}</span>
        </div>
      )
    },
    {
      header: 'Precio',
      render: (row) => (
        <div>
          <span className={`font-bold ${row.offer_price ? 'line-through text-gray-400 text-xs mr-2' : 'text-brand-dark'}`}>
            {row.price}€
          </span>
          {row.offer_price && <span className="font-bold text-brand-dark"> ({row.offer_price}€)</span>}
        </div>
      )
    },
    {
      header: 'Tipo / Tag',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-gray-500">{row.type?.name || '---'}</span>
          {row.tag && (
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full w-max bg-gray-100">
              {row.tag.title}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Opciones',
      render: (row) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${row.has_options ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
          {row.has_options ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      header: 'Estado Web',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className={`text-xs font-bold px-2 py-1 rounded-full w-max ${row.active ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
            {row.active ? 'Visible' : 'Oculto (Borrado)'}
          </span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full w-max ${row.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {row.available ? 'En Stock' : 'Agotado'}
          </span>
        </div>
      )
    },
    {
      header: 'Stock',
      render: (row) => (
        <div>
          <span className={`font-bold text-brand-dark`}>
            {row.stock}
          </span>
        </div>
      )
    },
  ];

  // 3. Controladores de acciones (Redirecciones y Borrado Lógico)
  const handleView = (product) => {
    navigate(`/administration/productos/${product.id}`);
  };

  const handleEdit = (product) => {
    navigate(`/administration/productos/${product.id}/edit`);
  };

  const handleDelete = async (product) => {
    // Doble confirmación por seguridad
    if (window.confirm(`¿Estás seguro de que deseas eliminar (ocultar) el producto "${product.name}"?`)) {
      try {
        await logicalDeleteProduct(product.id);
        loadProducts(); // Refrescar la tabla para actualizar la UI
      } catch (error) {
        console.error("Error borrando producto:", error);
        alert("No se pudo eliminar el producto. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-light p-2">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark mb-1">Inventario de Productos</h1>
        </div>
        <button
          onClick={() => navigate('/administration/productos/nuevo')}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg hover:shadow-brand-primary/30 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nuevo Producto
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-light flex justify-center items-center">
          <div className="text-brand-primary font-bold animate-pulse">Cargando catálogo...</div>
        </div>
      ) : (
        <TableReusable
          columns={productColumns}
          data={products}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ProductsScreen;