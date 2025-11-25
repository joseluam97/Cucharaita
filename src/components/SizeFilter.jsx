// SizeFilter.jsx (Código Modificado para estética anterior)
import { useMemo, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import useSizeFilterStore from "../store/sizeFilterStore";

const SizeFilter = ({ products, totalFiltered }) => {
  const ref = useRef(null);
  const { selectedSizes, handleFilter } = useSizeFilterStore();

  const sizes = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Nota: Asumo que 'type' del producto es lo que se usa para filtrar (Galleta, Vasitos, etc.)
    const allSizes = products.flatMap((product) => product.type);
    return [...new Set(allSizes)].sort();
  }, [products]);

  const handleSizeClick = (size) => {
    ref.current.continuousStart();

    const isSelected = selectedSizes.includes(size);
    const newSizes = isSelected
      ? selectedSizes.filter((item) => item !== size)
      : [...selectedSizes, size];

    setTimeout(() => {
      handleFilter(newSizes);
      ref.current.complete();
    }, 100);
  };

  return (
    <div className="mb-4">
      <LoadingBar color="#ff9c08" ref={ref} shadow={true} />

      {/* Etiqueta y contador 
      <h6 className="mb-2">
        Tipos de productos <span className="fw-bold">({totalFiltered})</span>
      </h6>

      <div className="d-flex flex-wrap align-items-center gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={selectedSizes.includes(size)
              ? "btn-dark" // Opción seleccionada
              : "btn-outline-dark" // Opción no seleccionada
            }
            onClick={() => handleSizeClick(size)}
            aria-pressed={selectedSizes.includes(size)}
          >
            {size}
          </button>
        ))}
      </div>*/}
    </div>
  );
};

export default SizeFilter;