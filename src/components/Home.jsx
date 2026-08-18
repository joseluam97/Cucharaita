import { Link } from 'react-router-dom';
import { BsTruck, BsStarFill, BsHeartFill, BsArrowRight, BsGift, BsCheck2Circle } from 'react-icons/bs';

const Home = () => {
  const placeholderImg = "https://res.cloudinary.com/dhurofi5m/image/upload/v1771428097/PACK_GALLETA_u1kdnj.jpg";
  const primaryColor = 'var(--cucharaita-principal, #1a4bb8)';

  return (
    <div style={{ backgroundColor: '#fdfbf7', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      <section 
        className="position-relative d-flex align-items-center text-center text-md-start"
        style={{ 
          minHeight: '85vh', 
          background: `url(${placeholderImg}) center/cover no-repeat`,
          marginTop: '-1px'
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}></div>
        
        <div className="container position-relative z-1 py-5 mt-5">
          <div className="row justify-content-center justify-content-md-start">
            <div className="col-12 col-md-8 col-lg-7 text-white">
              <span 
                className="badge rounded-pill mb-4 py-2 px-3 text-uppercase shadow-sm" 
                style={{ backgroundColor: primaryColor, letterSpacing: '1.5px', fontSize: '0.85rem' }}
              >
                Obrador Artesanal de Cookies
              </span>
              
              <h1 className="display-3 fw-bolder mb-4" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.4)', lineHeight: '1.1' }}>
                Cada galleta, <br />
                una historia crujiente.
              </h1>
              
              <p className="lead mb-5" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)', fontSize: '1.2rem', color: '#f8f9fa' }}>
                Horneadas a diario con devoción. Descubre texturas inigualables: desde el carácter rústico de nuestra avena hasta el corazón fundido de chocolate belga y avellanas.
              </p>
              
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
                <Link 
                  to="/tienda" 
                  className="btn btn-lg rounded-pill fw-bold px-5 py-3 shadow text-white d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: primaryColor, border: 'none' }}
                >
                  Ver Catálogo <BsArrowRight />
                </Link>
                <a 
                  href="#filosofia" 
                  className="btn btn-lg rounded-pill fw-semibold px-4 py-3 text-white bg-transparent border-white hover-bg-white"
                  style={{ border: '2px solid rgba(255,255,255,0.8)' }}
                >
                  Nuestra Receta
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE GARANTÍAS */}
      <section className="py-4 shadow-sm" style={{ backgroundColor: primaryColor, color: '#fff' }}>
        <div className="container">
          <div className="row text-center gy-4">
            <div className="col-12 col-md-4 d-flex flex-column align-items-center">
              <BsTruck className="fs-1 mb-2 opacity-75" />
              <h5 className="fw-bold text-uppercase mb-1" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>Envíos Cuidados</h5>
              <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>Directamente del horno a la puerta de tu casa.</p>
            </div>
            <div className="col-12 col-md-4 d-flex flex-column align-items-center">
              <BsHeartFill className="fs-1 mb-2 opacity-75" />
              <h5 className="fw-bold text-uppercase mb-1" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>Elaboración Diaria</h5>
              <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>Mantequilla pura y cero conservantes artificiales.</p>
            </div>
            <div className="col-12 col-md-4 d-flex flex-column align-items-center">
              <BsStarFill className="fs-1 mb-2 opacity-75" />
              <h5 className="fw-bold text-uppercase mb-1" style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>Packs Personalizables</h5>
              <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>Crea tu caja de 6 galletas a tu total antojo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORÍAS DE PRODUCTOS */}
      <section className="py-5 my-3">
        <div className="container text-center">
          <span className="text-uppercase fw-bold text-muted small tracking-widest d-block mb-2">Nuestras familias</span>
          <h2 className="display-5 fw-bold mb-3" style={{ color: 'var(--brand-dark, #212529)' }}>Explora los formatos</h2>
          <p className="text-muted mb-5 mx-auto" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
            Ya sea que busques el desayuno perfecto, un capricho gourmet por la tarde o un regalo inolvidable, tenemos un pack esperándote.
          </p>
          
          <div className="row justify-content-center gy-5">
            <div className="col-12 col-sm-8 col-md-4">
              <Link to="/tienda?cat=basicas" className="text-decoration-none text-dark d-block text-center group">
                <div className="mx-auto mb-4 p-2 rounded-circle bg-white shadow-sm transition-transform hover-scale" style={{ width: '250px', height: '250px', border: `2px dashed ${primaryColor}` }}>
                  <img src={placeholderImg} alt="Básicas" className="w-100 h-100 rounded-circle shadow-sm" style={{ objectFit: 'cover' }} />
                </div>
                <h3 className="h4 fw-bold mb-2">Línea Básica</h3>
                <p className="text-muted px-3 small">
                  Esenciales reconfortantes. Galletas rústicas de avena, toques de limón o clásicos imperdibles para el día a día.
                </p>
              </Link>
            </div>

            <div className="col-12 col-sm-8 col-md-4">
              <Link to="/tienda?cat=gourmet" className="text-decoration-none text-dark d-block text-center">
                <div className="mx-auto mb-4 p-2 rounded-circle bg-white shadow-sm transition-transform hover-scale" style={{ width: '250px', height: '250px', border: `2px dashed ${primaryColor}` }}>
                  <img src={placeholderImg} alt="Gourmet" className="w-100 h-100 rounded-circle shadow-sm" style={{ objectFit: 'cover' }} />
                </div>
                <h3 className="h4 fw-bold mb-2">Línea Gourmet</h3>
                <p className="text-muted px-3 small">
                  Nuestra máxima expresión repostera. Corazones fundidos, chocolate blanco con coco, brownie y roca de avellana.
                </p>
              </Link>
            </div>

            <div className="col-12 col-sm-8 col-md-4">
              <Link to="/tienda?cat=minis" className="text-decoration-none text-dark d-block text-center">
                <div className="mx-auto mb-4 p-2 rounded-circle bg-white shadow-sm transition-transform hover-scale" style={{ width: '250px', height: '250px', border: `2px dashed ${primaryColor}` }}>
                  <img src={placeholderImg} alt="Minis" className="w-100 h-100 rounded-circle shadow-sm" style={{ objectFit: 'cover' }} />
                </div>
                <h3 className="h4 fw-bold mb-2">Packs Minis</h3>
                <p className="text-muted px-3 small">
                  Pequeños bocados en formato caja ideal para degustar un poco de todo o sorprender a alguien especial.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE VALORES / INGREDIENTES (Nuevo contenido de marca) */}
      <section className="py-5 bg-white border-top border-bottom border-light">
        <div className="container py-4">
          <div className="row text-center mb-5">
            <div className="col-12">
              <span className="text-uppercase fw-bold text-muted small tracking-widest d-block mb-2">Calidad sin trampa</span>
              <h2 className="fw-bold h1">Lo que importa está en el interior</h2>
            </div>
          </div>
          <div className="row gy-4 text-start">
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 h-100 bg-light border-0 shadow-sm">
                <div className="fs-3 mb-3 text-primary">🍫</div>
                <h4 className="h5 fw-bold mb-2">Chocolate Real</h4>
                <p className="text-muted small mb-0">
                  Trabajamos con auténtico chocolate belga y negro puro. Nada de sucedáneos; queremos que cada trozo funda en tu boca de verdad.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 h-100 bg-light border-0 shadow-sm">
                <div className="fs-3 mb-3 text-primary">🧈</div>
                <h4 className="h5 fw-bold mb-2">Mantequilla de Verdad</h4>
                <p className="text-muted small mb-0">
                  La base de una galleta excepcional es su grasa. Usamos mantequilla pura de vaca que aporta ese aroma inconfundible al abrir la caja.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-4 rounded-4 h-100 bg-light border-0 shadow-sm">
                <div className="fs-3 mb-3 text-primary">⏰</div>
                <h4 className="h5 fw-bold mb-2">Horneadas al Momento</h4>
                <p className="text-muted small mb-0">
                  Controlamos los tiempos de reposo y cocinado al minuto. Buscamos siempre ese contraste soñado: bordes firmes y centro meloso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STORYTELLING (El Obrador) */}
      <section id="filosofia" className="py-5 my-2">
        <div className="container py-md-4">
          <div className="row align-items-center gx-5 gy-5">
            <div className="col-12 col-md-6">
              <div className="p-2 bg-white rounded-4 shadow-sm border">
                <img 
                  src={placeholderImg} 
                  alt="Nuestro Obrador" 
                  className="img-fluid rounded-4 shadow-sm" 
                  style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} 
                />
              </div>
            </div>
            
            <div className="col-12 col-md-6">
              <span className="text-uppercase fw-bold mb-2 d-block" style={{ color: primaryColor, letterSpacing: '2px', fontSize: '0.85rem' }}>
                Detrás del delantal
              </span>
              <h2 className="display-6 fw-bold mb-4" style={{ color: 'var(--brand-dark, #212529)' }}>
                Diseñamos galletas, <br /> no producimos en serie.
              </h2>
              
              <div className="mb-4 text-muted" style={{ lineHeight: '1.8', fontSize: '1.05rem' }}>
                <p>
                  Todo comienza en una libreta de recetas y pruebas constantes. Cada variedad de nuestra tienda online nace tras semanas calibrando cantidades exactas de azúcar, harina y temperatura de horno.
                </p>
                <p>
                  Huyendo de los conservantes industriales y las prisas, nuestro obrador huele cada mañana a mantequilla tostada y chocolate fundido. Queremos que al morder una de nuestras cookies sientas el cariño y la dedicación de un producto auténticamente hecho a mano.
                </p>
              </div>

              <div className="d-flex flex-column gap-2 mb-4">
                <div className="d-flex align-items-center gap-2 text-dark fw-semibold">
                  <BsCheck2Circle className="text-success fs-5" /> Ingredientes 100% locales y seleccionados.
                </div>
                <div className="d-flex align-items-center gap-2 text-dark fw-semibold">
                  <BsCheck2Circle className="text-success fs-5" /> Cero aditivos ni colorantes artificiales.
                </div>
              </div>

              <Link 
                to="/tienda" 
                className="btn rounded-pill fw-bold px-5 py-3 shadow-sm text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Elegir mis galletas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BANNER LLAMADA A LA ACCIÓN FINAL (Regalos / Packs) */}
      <section className="py-5 text-white text-center position-relative overflow-hidden" style={{ backgroundColor: '#212529' }}>
        <div className="container position-relative z-1 py-4">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <BsGift className="display-4 mb-3 text-warning" />
              <h2 className="fw-bold display-6 mb-3">¿Quieres hacer un regalo inolvidable?</h2>
              <p className="lead text-white-50 mb-4">
                Configura una caja personalizada combinando tus sabores favoritos o regala un pack sorpresa. ¡Triunfarás seguro en cualquier celebración!
              </p>
              <Link 
                to="/tienda" 
                className="btn btn-light btn-lg rounded-pill fw-bold px-5 py-3 shadow"
                style={{ color: '#212529' }}
              >
                Diseñar mi caja ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;