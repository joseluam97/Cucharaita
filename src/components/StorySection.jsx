import React from 'react';

const StorySection = () => {
  return (
    <section className="py-16 md:py-24 px-4 max-w-5xl mx-auto text-center">
      <span className="text-brand-primary font-bold tracking-widest uppercase text-sm mb-4 block">
        Nuestro Secreto
      </span>
      <h2 className="text-3xl md:text-5xl font-cooper text-brand-dark mb-6">
        No hacemos galletas, <br className="hidden md:block"/> creamos momentos.
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto font-sans leading-relaxed">
        Cada madrugada encendemos los hornos para crear recetas únicas. 
        Desde el toque crujiente de una clásica hasta el corazón fundido de nuestras opciones más atrevidas. 
        Utilizamos ingredientes reales, sin atajos, porque creemos que el verdadero sabor artesanal requiere tiempo, paciencia y mucha pasión.
      </p>
    </section>
  );
};

export default StorySection;