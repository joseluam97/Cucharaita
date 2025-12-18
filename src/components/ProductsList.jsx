import ProductCard from "./ProductCard";

const ProductsList = ({ products }) => {
  return (
    /* px-1: Reduce el padding lateral al mínimo en móviles.
       px-md-3: Recupera un padding normal en tablets/PC.
    */
    <div className="container-fluid px-1 px-md-3 my-0">
      {/* g-2: Reduce el espacio entre tarjetas en móvil (8px aprox).
          g-md-4: Mantiene el espacio amplio en escritorio (24px aprox).
      */}
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