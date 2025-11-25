import Typewriter from "typewriter-effect";
import imgShopping from "../assets/imgs/logo_reducido.png";

const TitleTypeWriter = () => {
  return (
    <section className="row align-items-center">
      <div className="col-12 col-md-7">
        <h1 className="display-5 titulo">
          Bienvenidos a{" "}
          <span style={{ color: "#ff9c08" }}> Cucharaita</span> 🍪
        </h1>
        <h3 className="text-center">
          <Typewriter
            options={{
              strings: [" ✋ Hola, somos Cucharaita", "Postres individuales hechos con amor🍪✨", "Cada bocado, una cucharada de felicidad 🌈💫"],
              autoStart: true,
              loop: true,
              deleteSpeed: 50, // Velocidad de eliminación
              delay: 75, // Velocidad de escritura
            }}
          />
        </h3>
      </div>
      <div className="col-12 col-md-5 text-center">
        <img
          style={{ width: "350px", maxWidth: "100%" }}
          src={imgShopping}
          alt="Ecommerce"
          className="img-fluid text-center px-3"
        />
      </div>
    </section>
  );
};

export default TitleTypeWriter;
