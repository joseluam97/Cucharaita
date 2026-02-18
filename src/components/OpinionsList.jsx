import React from 'react';
import useOpinionsList from '../hooks/useOpinionsList'; // Importamos tu nuevo hook
import { FaStar, FaRegStar, FaQuoteLeft } from 'react-icons/fa';

const OpinionsList = () => {
  // Usamos el hook para obtener la lógica y los datos
  const { reviews, loading, error } = useOpinionsList();

  // Helper visual para estrellas (solo presentación)
  const renderStars = (score) => {
    const stars = [];
    const starCount = Math.round(score / 2); // Asumiendo score sobre 10
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= starCount
          ? <FaStar key={i} className="text-warning" size={14} />
          : <FaRegStar key={i} className="text-muted" size={14} />
      );
    }
    return stars;
  };

  if (loading) return (
    <div className="container my-5 text-center">
      <div className="spinner-border text-warning" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-muted">Cargando opiniones...</p>
    </div>
  );

  if (error) return <div className="text-center mt-5 text-danger">Error al cargar opiniones.</div>;

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold display-6">Lo que dicen nuestros clientes</h2>
        <p className="text-muted">Opiniones reales verificadas</p>
      </div>

      <div className="row masonry-grid">
        {reviews.map((review) => (
          <div key={review.fullId} className="col-md-6 col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#fffcf5' }}>
              <div className="card-body">

                {/* Cabecera */}
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <h5 className="fw-bold mb-0">{review.clientName}</h5>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{review.date}</small>
                  </div>
                  <div className="text-center">
                    <div className="h4 fw-bold text-success mb-0">{review.average}</div>
                    <div className="d-flex gap-1 justify-content-center">
                      {renderStars(review.average)}
                    </div>
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="review-list">
                  <p className="small text-muted mb-2 fst-italic">
                    <FaQuoteLeft size={10} className="me-1" /> Productos valorados:
                  </p>
                  <ul className="list-unstyled mb-0">
                    {review.products.map((prod, index) => (
                      <li key={index} className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-dark text-truncate" style={{ maxWidth: '70%' }}>
                          • {prod.name}
                        </span>
                        <span className="badge bg-white text-dark border px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          {prod.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
              <div className="card-footer bg-transparent border-0 text-end">
                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Ref: {review.fullId}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpinionsList;