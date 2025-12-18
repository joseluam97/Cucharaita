// ProductsList.jsx
import ProductCard from "./ProductCard";

const ProductsList = ({ products }) => {
  return (
    <div className="container my-5">
      {/* row-cols-2: 2 elementos en móvil (por defecto)
          row-cols-md-2: 2 elementos en tablets
          row-cols-lg-4: 4 elementos en ordenadores
      */}
      <div className="row row-cols-2 row-cols-md-2 row-cols-lg-4 g-4">
        {products.map((product) => (
          <div className="col" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;