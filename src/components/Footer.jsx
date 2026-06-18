import { FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer mt-5 py-5" style={{ backgroundColor: 'var(--cucharaita-principal)', color: 'var(--cucharaita-secundario-3)' }}>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-md-6 text-center text-md-start mb-4 mb-md-0">
            <h4 className="mb-2" style={{ fontFamily: "'Cooper Black', 'Baloo 2', serif", fontSize: '1.8rem', color: 'var(--text-light)' }}>
                Cucharaita
            </h4>
            <p className="mb-0" style={{ opacity: 0.8 }}>
              &copy; 2026 || Repostería artesanal.<br/>Todos los derechos reservados.
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <p className="mb-2 fw-bold text-white">Síguenos en el obrador:</p>
            <div className="social-icons d-inline-flex justify-content-center align-items-center p-3 rounded-circle shadow-sm" style={{ backgroundColor: 'var(--cucharaita-secundario-3)' }}>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.instagram.com/cucharaita_/"
                style={{ color: 'var(--cucharaita-principal)', fontSize: '1.5rem', transition: 'transform 0.2s ease' }}
                className="hover-scale"
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;