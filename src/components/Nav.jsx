import logo from "../assets/imgs/logo_reducido.png";
import MyCart from "./MyCart";
import { CiMenuFries } from "react-icons/ci";
import { Link } from "react-router-dom"; 

const Nav = () => {
    return (
        <nav className="navbar navbar-expand-lg w-100 shadow-lg bg-brand-primary py-3 z-50">
            <div className="container-fluid px-3 px-md-5 d-flex justify-content-between align-items-center relative">
                
                {/* IZQUIERDA: Botón de Menú */}
                <div className="d-flex align-items-center z-10">
                    <button
                        className="navbar-toggler border-0 shadow-none p-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        {/* Contenedor del icono con Tailwind */}
                        <div className="shadow-sm bg-brand-cream rounded-xl w-12 h-12 flex items-center justify-center transition-transform duration-200 hover:scale-105">
                            <CiMenuFries className="text-brand-primary text-2xl font-bold" />
                        </div>
                    </button>
                </div>

                {/* CENTRO: Logo centrado absoluto */}
                <Link className="navbar-brand m-0 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" to="/"> 
                    <img src={logo} alt="Cucharaita Logo" 
                         className="w-[300px] md:w-[120px] drop-shadow-md transition-all duration-300"
                    />
                </Link>

                {/* DERECHA: Carrito */}
                <div className="d-flex align-items-center z-10">
                    <MyCart />
                </div>

            </div>
        </nav>
    );
};

export default Nav;