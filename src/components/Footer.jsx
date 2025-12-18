import {
  FaInstagram,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white mt-5 py-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              &copy; 2024{" "}
              <a className="text-white text-decoration-none">
                Cucharaita
              </a>{" "}
              || Todos los derechos reservados.
            </p>
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <div className="social-icons d-inline-flex justify-content-center">
              <a
                target="_blank"
                rel="noreferrer"
                href="https://www.instagram.com/cucharaita_/"
                className="text-white me-3"
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
