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

  // 🛑 CAMBIO 1: Inicialización simple, el useEffect se encargará de llenarlo con caché si existe
  const [listProduct, setListProduct] = useState([]);

  // Estado para simular carga mínima
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

  // 🛑 CAMBIO 2: Lógica de carga/simulación
  useEffect(() => {
    // Si la data está cargada (loading: false, por caché o fetch), desactivamos la simulación inmediatamente.
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


  // UseEffect para manejar el estado de balanceo (tu lógica existente)
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

      // No necesitamos el timer de 1s aquí, ya lo maneja el otro useEffect
      // return () => clearTimeout(timer); // Eliminado
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

  // 🛑 CAMBIO 3: useEffect para sincronizar `products` con `listProduct` y aplicar el filtro de tipo
  useEffect(() => {
    // 1. Empezamos con los productos filtrados por talla
    let productsToShow = filteredProducts;

    // 2. Si hay un filtro de tipo seleccionado, aplicamos el filtro de tipo a los ya filtrados por talla
    if (typeSelectedFilter) {
      productsToShow = productsToShow.filter(product => product.type.id === typeSelectedFilter.id);
    }

    // 3. Sincronizamos el estado local.
    setListProduct(productsToShow || []);
  }, [products, filteredProducts, typeSelectedFilter]); // Depende de la data base y los filtros

  const filterByType = ((type) => {

    const newType = type?.id === typeSelectedFilter?.id ? null : type;
    setTypeSelectedFilter(newType);

    // 🛑 NOTA: La sincronización (setListProduct) ahora se hace en el useEffect (CAMBIO 3)
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
              // btn-sm en móvil para ahorrar espacio, normal en escritorio
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
        {/* 🛑 CAMBIO 4: Nueva lógica de visualización */}
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