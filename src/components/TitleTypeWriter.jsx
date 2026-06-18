import Typewriter from "typewriter-effect";
import { BsArrowRight, BsStarFill } from "react-icons/bs";

const TitleTypeWriter = () => {
  return (
    // pt-32 garantiza que el menú superior fijo no tape el contenido
    <section className="relative pt-32 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">


      {/* COLUMNA IZQUIERDA: Mensaje de Marca (Tipografía Cooper) */}
      <div className="flex-1 text-left pt-200">
        <span className="block text-brand-primary font-bold tracking-widest uppercase text-sm mb-4">
        </span>
      </div>


      {/* COLUMNA IZQUIERDA: Textos y Botones */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">

        {/* Insignia / Badge Superior */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent text-brand-primary font-bold text-sm mb-6 shadow-sm">
          <BsStarFill className="text-brand-primary" />
          <span>100% Repostería Artesanal</span>
        </div>

        {/* Titular Principal */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-cooper text-brand-dark leading-tight mb-4 drop-shadow-sm">
          Cada galleta, <br />
          <span className="text-brand-primary">una historia.</span>
        </h1>

        {/* Subtítulo Dinámico (Typewriter) */}
        <div className="text-lg md:text-xl text-gray-600 mb-8 h-16 md:h-20 font-medium">
          <p className="text-xl text-gray-600 mb-10 max-w-md font-sans">
            Horneadas artesanalmente cada día con los mejores ingredientes.
            Descubre nuestra selección de galletas gourmet y formatos únicos.
          </p>
        </div>

      </div>

      {/* COLUMNA DERECHA: Imagen de Impacto */}
      <div className="w-full md:w-1/2 relative mt-8 md:mt-0 pt-[10px]">
        {/* Mancha de color de fondo para dar contraste a la imagen */}
        <div className="absolute inset-0 bg-brand-light rounded-full blur-3xl opacity-40 -z-10 transform scale-105 translate-y-8"></div>

        {/* ⚠️ IMPORTANTE: Cambia el 'src' por una foto tuya real de las galletas gourmet */}
        <img
          src="https://res.cloudinary.com/dhurofi5m/image/upload/v1771428097/PACK_GALLETA_u1kdnj.jpg"
          alt="Galletas Cucharaita"
          className="w-full h-auto max-h-[500px] object-cover rounded-[2.5rem] shadow-2xl border-4 border-brand-white"
        />
        
        {/* Botones de Acción (CTAs) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
            className="bg-brand-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-brand-secondary transition-all shadow-xl hover:shadow-brand-primary/30"
          >
            Ver catálogo <BsArrowRight className="text-xl" />
          </button>
        </div>

        {/* Cartelito flotante animado */}
        <div className="absolute -bottom-6 -left-4 md:-left-8 bg-brand-cream border-2 border-brand-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-[bounce_3s_infinite] mb-[10px]">
          <div className="flex flex-col text-left">
            <span className="font-cooper text-brand-primary leading-none text-lg">¡Recién</span>
            <span className="font-bold text-brand-dark text-sm uppercase tracking-wider">Horneadas!</span>
          </div>
        </div>
      </div>

    </section>
  );
};

export default TitleTypeWriter;