// src/components/Home.jsx

import { useEffect, useMemo, useState } from "react";
// Importa todos los stores y hooks necesarios para la lógica del Home
import useCartStore from "../store/cartStore";
import useOffcanvasStore from "../store/offcanvasStore";
import useTotalStore from "../store/totalProductStore";
import useBalanceStore from "../store/balanceStore";
import useSizeFilterStore from "../store/sizeFilterStore";

import ProductsList from "./ProductsList";
import SizeFilter from "./SizeFilter";
import useProducts from "../hooks/useProducts";
import useTypes from "../hooks/useTypes";
import TitleTypeWriter from "./TitleTypeWriter";
import SizeFilterSkeleton from "./SizeFilterSkeleton";

const Home = () => {
  // Llama a `useCartStore` para acceder al estado del carrito y las funciones
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();
  const { selectedSizes } = useSizeFilterStore();

  const [typeSelectedFilter, setTypeSelectedFilter] = useState(null);

  // Usar el hook useProducts para obtener los productos
  const { data: products, loading, error } = useProducts({});
  const { data: listTypes } = useTypes({});

  const [listProduct, setListProduct] = useState([]);

  // Estado para simular carga mínima
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsSimulatedLoading(false);
      return;
    }

    // Si aún está cargando, aplicamos la simulación de 1 segundo para la UX de primera carga.
    const timer = setTimeout(() => {
      setIsSimulatedLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading]); // Se ejecuta cuando el estado de loading cambia


  useEffect(() => {
    if (cart.length > 0) {
      const totalProductsBalanceo = getTotalProducts(cart); // Calcula los productos únicos
      // Abre el carrito solo si no está visible
      if (!isVisible) {
        toggleOffcanvas(true);
      }

      // Activa la animación si hay productos únicos
      if (totalProductsBalanceo > 0) {
        toggleBalanceo(true);
      }

    }
  }, [cart, getTotalProducts, toggleBalanceo, toggleOffcanvas]);

  // Filtrar productos por talla seleccionada (BASE DE DATOS)
  const filteredProducts = useMemo(() => {
    if (!selectedSizes.length || !products) return products; // Si no hay tallas seleccionadas, devolver todos los productos

    return products.filter(
      (product) =>
        selectedSizes.some((size) => product.options.includes(size)) // Filtrar si el producto tiene alguna talla seleccionada
    );
  }, [selectedSizes, products]); // Dependemos tanto de `selectedSizes` como de `products`

  useEffect(() => {
    // 1. Empezamos con los productos filtrados por talla
    let productsToShow = filteredProducts;

    // 2. Si hay un filtro de tipo seleccionado, aplicamos el filtro de tipo a los ya filtrados por talla
    if (typeSelectedFilter) {
      productsToShow = productsToShow.filter(product => product.type.id === typeSelectedFilter.id);
    }

    // 3. Sincronizamos el estado local.
    setListProduct(productsToShow || []);
  }, [products, filteredProducts, typeSelectedFilter]);

  const filterByType = ((type) => {
    const newType = type?.id === typeSelectedFilter?.id ? null : type;
    setTypeSelectedFilter(newType);

  })


  return (
    <div className="container mt-5 mb-0">
      <TitleTypeWriter />

      <div
        className="d-flex flex-wrap justify-content-center gap-2 gap-md-3 mb-2 mt-0 p-2 p-md-3 rounded shadow-sm"
        style={{ backgroundColor: '#c7d088' }}
      >
        {listTypes?.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`btn ${
              window.innerWidth < 768 ? "btn-sm" : "btn-md"
              } ${type.id === typeSelectedFilter?.id ? "btn-dark" : "btn-outline-dark"
              } flex-grow-0 text-nowrap`} // Evita que el texto se rompa en dos líneas
            style={{
              borderRadius: '20px', // Estilo más moderno y compacto
              fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem'
            }}
            onClick={() => filterByType(type)}
          >
            {type?.name}
          </button>
        ))}
      </div>

      <div className="row">
        {loading && isSimulatedLoading ? (
          <div className="col-12 text-center my-5">Cargando productos...</div>
        ) : (
          <>
            {listProduct?.length > 0 ? (
              <div className="col-12">
                <ProductsList products={listProduct} />
              </div>
            ) : (
              <div className="col-12">
                <p className="text-center">No hay productos disponibles para los filtros seleccionados.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;