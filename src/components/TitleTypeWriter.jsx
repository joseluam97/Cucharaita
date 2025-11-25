import Typewriter from "typewriter-effect";
import imgShopping from "../assets/imgs/logo_reducido.png";

const TitleTypeWriter = () => {
  return (
    <section className="row justify-content-center align-items-center my-0">
      <div className="col-12 col-md-10 text-center">
        <h1 className="display-5 titulo text-center">
          Bienvenidos a{" "}
          <span style={{ color: "#ff9c08" }}> Cucharaita</span> 🍪
        </h1>
        <h3 className="text-center">
          <Typewriter
            options={{
              strings: [" ✋ Hola, somos Cucharaita", "Postres individuales hechos con amor🍪✨", "Cada bocado, una cucharada de felicidad 🌈💫"],
              autoStart: true,
              loop: true,
              deleteSpeed: 50,
              delay: 75,
            }}
          />
        </h3>
      </div>
    </section>
  );
};

export default TitleTypeWriter;