// src/components/Home.jsx

import { useEffect, useMemo, useState } from "react";
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
  const { cart } = useCartStore();
  const { getTotalProducts } = useTotalStore();
  const { toggleBalanceo } = useBalanceStore();
  const { isVisible, toggleOffcanvas } = useOffcanvasStore();
  const { selectedSizes } = useSizeFilterStore();

  const [typeSelectedFilter, setTypeSelectedFilter] = useState(null);

  const { data: products, loading, error } = useProducts({});
  const { data: listTypes } = useTypes({});

  const [listProduct, setListProduct] = useState([]);
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsSimulatedLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSimulatedLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading]);


  useEffect(() => {
    if (cart.length > 0) {
      const totalProductsBalanceo = getTotalProducts(cart);
      if (!isVisible) {
        toggleOffcanvas(true);
      }

      if (totalProductsBalanceo > 0) {
        toggleBalanceo(true);
      }
    }
  }, [cart, getTotalProducts, toggleBalanceo, toggleOffcanvas]);

  const filteredProducts = useMemo(() => {
    if (!selectedSizes.length || !products) return products;

    return products.filter(
      (product) =>
        selectedSizes.some((size) => product.options.includes(size))
    );
  }, [selectedSizes, products]);

  useEffect(() => {
    let productsToShow = filteredProducts;

    if (typeSelectedFilter) {
      productsToShow = productsToShow.filter(product => product.type.id === typeSelectedFilter.id);
    }

    setListProduct(productsToShow || []);
  }, [products, filteredProducts, typeSelectedFilter]);

  const filterByType = ((type) => {
    const newType = type?.id === typeSelectedFilter?.id ? null : type;
    setTypeSelectedFilter(newType);
  })

  return (
    <div className="container-fluid px-0">
      <TitleTypeWriter />

      <div
        className="d-flex flex-wrap justify-content-center gap-2 gap-md-3 mb-4 mt-0 p-3 rounded-4 shadow-sm"
        style={{
          backgroundColor: 'var(--cucharaita-secundario-3)',
          border: '1px solid var(--cucharaita-secundario-2)'
        }}
      >
        {listTypes?.map((type) => {
          const isActive = type.id === typeSelectedFilter?.id;
          return (
            <button
              key={type.id}
              type="button"
              className={`btn ${window.innerWidth < 768 ? "btn-sm" : "btn-md"} flex-grow-0 text-nowrap shadow-sm`}
              style={{
                borderRadius: '25px',
                fontSize: window.innerWidth < 768 ? '0.85rem' : '1rem',
                backgroundColor: isActive ? 'var(--cucharaita-principal)' : 'var(--text-light)',
                color: isActive ? 'var(--text-light)' : 'var(--cucharaita-principal)',
                border: `2px solid var(--cucharaita-principal)`,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                padding: '8px 20px'
              }}
              onClick={() => filterByType(type)}
            >
              {type?.name}
            </button>
          )
        })}
      </div>

      <div className="row">
        {loading && isSimulatedLoading ? (
          <div className="col-12 text-center my-5 fs-5 fw-bold" style={{ color: 'var(--cucharaita-principal)' }}>
            Horneando galletas...
          </div>
        ) : (
          <>
            {listProduct?.length > 0 ? (
              <div className="col-12">
                <ProductsList products={listProduct} />
              </div>
            ) : (
              <div className="col-12">
                <p className="text-center mt-4 lead text-muted">No hay productos disponibles para los filtros seleccionados.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;