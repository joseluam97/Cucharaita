import { useEffect, useMemo, useState } from "react";
import useCartStore from "../store/cartStore";
import useOffcanvasStore from "../store/offcanvasStore";
import useTotalStore from "../store/totalProductStore";
import useBalanceStore from "../store/balanceStore";
import useSizeFilterStore from "../store/sizeFilterStore";

import ProductsList from "../components/ProductsList"; // Componente existente
import useProducts from "../hooks/useProducts";
import useTypes from "../hooks/useTypes";

const Tienda = () => {
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();
  const { selectedSizes } = useSizeFilterStore();

  const [typeSelectedFilter, setTypeSelectedFilter] = useState(null);

  const { data: products, loading } = useProducts({});
  const { data: listTypes } = useTypes({});

  const [listProduct, setListProduct] = useState([]);
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

  // Simulación de carga para estética
  useEffect(() => {
    if (!loading) {
      setIsSimulatedLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsSimulatedLoading(false), 800);
    return () => clearTimeout(timer);
  }, [loading]);

  // Manejo de Offcanvas del Carrito
  useEffect(() => {
    if (cart.length > 0) {
      const totalProductsBalanceo = getTotalProducts(cart);
      if (!isVisible) toggleOffcanvas(true);
      if (totalProductsBalanceo > 0) toggleBalanceo(true);
    }
  }, [cart, getTotalProducts, toggleBalanceo, toggleOffcanvas]);

  // Lógica de Filtrado
  const filteredProducts = useMemo(() => {
    if (!selectedSizes.length || !products) return products;
    return products.filter((product) =>
      selectedSizes.some((size) => product.options.includes(size))
    );
  }, [selectedSizes, products]);

  useEffect(() => {
    let productsToShow = filteredProducts;
    if (typeSelectedFilter) {
      productsToShow = productsToShow.filter(
        (product) => product.type.id === typeSelectedFilter.id
      );
    }
    setListProduct(productsToShow || []);
  }, [products, filteredProducts, typeSelectedFilter]);

  const filterByType = (type) => {
    const newType = type?.id === typeSelectedFilter?.id ? null : type;
    setTypeSelectedFilter(newType);
  };

  return (
    <div className="w-full bg-[#fdfbf7] min-h-screen pt-24 pb-16"> {/* pt-24 da espacio al navbar */}
      
      {/* CABECERA DE LA TIENDA */}
      <div className="text-center max-w-4xl mx-auto px-4 mb-10">
        <h1 className="text-4xl md:text-5xl font-cooper text-brand-dark mb-4">Nuestra selección de <br/> Galletas y Cookies</h1>
        <p className="text-gray-500">Irresistibles bocados recién salidos del horno. Esta es nuestra selección diseñada para dar cobertura a todos los gustos.</p>
      </div>

      {/* BARRA DE FILTROS (Tipos) */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-3 p-2">
          {listTypes?.map((type) => {
            const isActive = type.id === typeSelectedFilter?.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => filterByType(type)}
                className={`
                  px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 border-2
                  ${isActive 
                    ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary hover:text-brand-primary'
                  }
                `}
              >
                {type?.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="max-w-7xl mx-auto px-4">
        {loading || isSimulatedLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-bold text-brand-primary">Preparando el catálogo...</p>
          </div>
        ) : (
          <>
            {listProduct?.length > 0 ? (
              /* Reutilizamos tu componente ProductsList intacto */
              <ProductsList products={listProduct} />
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-2xl text-gray-400 font-cooper mb-2">¡Ups!</p>
                <p className="text-gray-500">No hay galletas disponibles para los filtros seleccionados.</p>
                <button 
                  onClick={() => setTypeSelectedFilter(null)}
                  className="mt-4 text-brand-primary underline font-bold"
                >
                  Ver todas las galletas
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default Tienda;