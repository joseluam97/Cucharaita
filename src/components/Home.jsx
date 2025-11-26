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
import TitleTypeWriter from "./TitleTypeWriter";
import SizeFilterSkeleton from "./SizeFilterSkeleton";

const Home = () => {
  // Llama a `useCartStore` para acceder al estado del carrito y las funciones
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();
  const { selectedSizes } = useSizeFilterStore();

  // Usar el hook useProducts para obtener los productos
  const { data: products, loading, error } = useProducts({});

  // Estado para simular carga mínima
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

  // UseEffect para manejar el estado de balanceo y la carga mínima
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSimulatedLoading(false); // Desactiva la carga simulada después de 1 segundo
    }, 1000);

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

      return () => clearTimeout(timer); // Limpiar el temporizador al desmontar el componente
    }

    return () => clearTimeout(timer); // Limpiar el temporizador al desmontar el componente
  }, [cart, getTotalProducts, toggleBalanceo, toggleOffcanvas]);

  // Filtrar productos por talla seleccionada
  const filteredProducts = useMemo(() => {
    if (!selectedSizes.length) return products; // Si no hay tallas seleccionadas, devolver todos los productos

    return products.filter(
      (product) =>
        selectedSizes.some((size) => product.options.includes(size)) // Filtrar si el producto tiene alguna talla seleccionada
    );
  }, [selectedSizes, products]); // Dependemos tanto de `selectedSizes` como de `products`

  // Obtener el total de productos filtrados usando useMemo
  const totalFiltered = useMemo(() => {
    // Si no hay filtros aplicados, mostrar el total de productos
    if (selectedSizes.length === 0) {
      return products?.length || 0; // Devuelve 0 si no hay productos
    }
    // Si hay filtros, mostrar el total de productos filtrados
    return filteredProducts.length;
  }, [selectedSizes, filteredProducts, products]);

  return (
    <div className="container mt-5 mb-5">
      <TitleTypeWriter />

      {/* Renderizado de filtros o esqueletos/errores */}
      {/* Puedes descomentar esto cuando necesites el filtro de tallas */}
      {/*loading || isSimulatedLoading ? (
        <SizeFilterSkeleton />
      ) : error ? (
        <div className="alert alert-danger text-center" role="alert">
          Error cargando productos: {error.message}
        </div>
      ) : (
        <SizeFilter products={products} totalFiltered={totalFiltered} />
      )*/}

      <div className="row">
        {filteredProducts?.length > 0 && !loading && !isSimulatedLoading && (
          <div className="col-12">
            <ProductsList products={filteredProducts} />
          </div>
        )}
        {(!loading && !isSimulatedLoading && filteredProducts?.length === 0) && (
          <div className="col-12">
            <p className="text-center">No hay productos disponibles para los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;