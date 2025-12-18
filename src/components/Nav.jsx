import logo from "../assets/imgs/logo_reducido.png";
import MyCart from "./MyCart";
import { CiMenuFries } from "react-icons/ci";
import { Link } from "react-router-dom"; 

const Nav = () => {
    return (
        // Usamos bg-dark o el color de tu tema
        <nav className="navbar navbar-expand-lg bg-dark mb-1 custom-navbar fixed-top w-100">
            <div className="container-fluid">
                
                {/* 1. Botón Toggler y Logo (Para móviles) */}
                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <CiMenuFries className="menu-icon text-white" />
                </button>
                
                {/* 2. Logo (Se mantiene en la izquierda por defecto en mobile, pero lo centraremos visualmente más adelante) */}
                {/* El 'Link' es preferible a 'a' con 'href' para navegación interna de React */}
                <Link className="navbar-brand d-none d-lg-block mx-auto" to="/"> 
                    <img style={{ width: "100px" }} src={logo} alt="logo" style={{ width: "100px" }} />
                </Link>

                {/* 3. Contenedor de elementos colapsables (Menú) 
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto"> 
                        <li className="nav-item">
                            <Link className="nav-link active text-white" aria-current="page" to="/">
                                Inicio
                            </Link>
                        </li>
                    </ul>
                </div>*/}
                
                {/* 4. Contenedor Derecha: Logo (Mobile) y Carrito */}
                <div className="d-flex align-items-center">
                    
                    {/* Logo solo visible en resoluciones pequeñas (si lo quieres duplicado a la izquierda) */}
                    <Link className="navbar-brand d-lg-none" to="/"> 
                        <img src={logo} alt="logo" style={{ width: "100px" }} />
                    </Link>
                    
                    {/* Carrito a la derecha (Margen automático a la izquierda para empujar) */}
                    <MyCart />
                </div>
            </div>
        </nav>
    );
};

export default Nav;