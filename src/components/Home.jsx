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

  const [listProduct, setListProduct] = useState([]);
  const [typeSelectedFilter, setTypeSelectedFilter] = useState(null);

  // Usar el hook useProducts para obtener los productos
  const { data: products, loading, error } = useProducts({});
  const { data: listTypes } = useTypes({});

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
  useEffect(() => {
    setListProduct(products);
  }, [products]);

  const filterByType = ((type) => {

    // If the same type is selected, clear the filter
    if (type?.id === typeSelectedFilter?.id) {
      setTypeSelectedFilter(null);
      setListProduct(products);
      return;
    }

    // If a new type is selected, filter the products
    setTypeSelectedFilter(type);
    let allProducts = [];

    allProducts = [...products].filter((product) => {
      if (product.type.id === type.id) {
        return product;
      }
    });
    setListProduct(allProducts);
  })


  return (
    <div className="container mt-5 mb-5">
      <TitleTypeWriter />

      <div
        className="d-flex flex-wrap justify-content-center gap-3 mb-0 mt-2 p-3 rounded shadow-sm"
        style={{ backgroundColor: '#c7d088' }} // Color de fondo claro para resaltar
      >
        {listTypes?.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`btn btn-lg ${type.id === typeSelectedFilter?.id ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => filterByType(type)}
          >
            {type?.name}
          </button>
        ))}
      </div>

      <div className="row">
        {listProduct?.length > 0 && !loading && !isSimulatedLoading && (
          <div className="col-12">
            <ProductsList products={listProduct} />
          </div>
        )}
        {(!loading && !isSimulatedLoading && listProduct?.length === 0) && (
          <div className="col-12">
            <p className="text-center">No hay productos disponibles para los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;