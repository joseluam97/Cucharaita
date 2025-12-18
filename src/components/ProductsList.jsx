import ProductCard from "./ProductCard";

const ProductsList = ({ products }) => {
  return (
    <div className="container-fluid px-1 px-md-3 my-0">
      <div className="row row-cols-2 row-cols-md-2 row-cols-lg-4 g-2 g-md-4">
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