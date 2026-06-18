import ProductCard from "./ProductCard";

const ProductsList = ({ products }) => {
  return (
    <div className="w-full px-2 md:px-4 my-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 justify-center">
        {products.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;