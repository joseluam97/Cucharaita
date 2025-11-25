// ProductsList.jsx
import ProductCard from "./ProductCard"; // Importa el nuevo componente

const ProductsList = ({ products }) => {
  return (
    <div className="container my-5">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {products.map((product) => (
          <div className="col" key={product.id}>
            <ProductCard product={product} /> {/* Usa el nuevo componente */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;