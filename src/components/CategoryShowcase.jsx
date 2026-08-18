import React from 'react';

const CategoryShowcase = () => {
  const categories = [
    {
      id: 'basicas',
      title: 'Básicas',
      desc: 'El sabor rústico y tradicional. Perfectas para mojar en café, como nuestra avena rústica.',
      img: 'https://res.cloudinary.com/dhurofi5m/image/upload/v1771428097/PACK_GALLETA_u1kdnj.jpg',
      color: 'bg-amber-100'
    },
    {
      id: 'gourmet',
      title: 'Gourmet',
      desc: 'Rellenos fundidos, texturas complejas. Descubre la intensidad del brownie o el pistacho clásico.',
      img: 'https://res.cloudinary.com/dhurofi5m/image/upload/v1771428097/PACK_GALLETA_u1kdnj.jpg',
      color: 'bg-rose-100'
    },
    {
      id: 'minis',
      title: 'Packs Minis',
      desc: 'Pequeños bocados de felicidad para compartir. Ideal para degustaciones y regalos.',
      img: 'https://res.cloudinary.com/dhurofi5m/image/upload/v1771428097/PACK_GALLETA_u1kdnj.jpg',
      color: 'bg-blue-100'
    }
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <div key={cat.id} className={`${cat.color} rounded-[2rem] p-8 text-center transition-transform hover:-translate-y-2 cursor-pointer`}>
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md">
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-2xl font-cooper text-brand-dark mb-3">{cat.title}</h3>
            <p className="text-gray-700 font-sans text-sm">{cat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryShowcase;