import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const bannerAds = [
  { id: 1, title: "Coleção Atemporal de Inverno", subtitle: "Cortes minimalistas com tecidos nobres premium.", bg: "bg-neutral-950 text-white" },
  { id: 2, title: "Alfaiataria Desconstruída", subtitle: "Elegância e modernidade fluida para o cotidiano.", bg: "bg-sophisticated-primary text-white" },
  { id: 3, title: "Seda & Linho Puro", subtitle: "Texturas orgânicas feitas para durar gerações.", bg: "bg-neutral-100 text-sophisticated-text" }
];

export default function Home({ addToCart, setCurrentTab }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-16">
      {/* Carrossel Autônomo */}
      <div className="relative h-[480px] w-full overflow-hidden rounded-sm shadow-sm">
        {bannerAds.map((ad, idx) => (
          <div 
            key={ad.id} 
            className={`absolute inset-0 w-full h-full p-12 md:p-24 flex flex-col justify-center transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'} ${ad.bg}`}
          >
            <span className="text-xs uppercase tracking-widest font-semibold opacity-80 mb-2">Lançamento</span>
            <h1 className="text-3xl md:text-5xl font-light tracking-wide max-w-2xl mb-4">{ad.title}</h1>
            <p className="text-sm opacity-90 max-w-md mb-8 tracking-wide">{ad.subtitle}</p>
            <button onClick={() => setCurrentTab('produtos')} className="w-fit flex items-center gap-2 border border-current px-6 py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-sophisticated-text transition font-medium">
              Explorar Peças <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Seção Conceito */}
      <div className="text-center max-w-xl mx-auto py-8">
        <h2 className="text-xs uppercase tracking-[0.3em] text-sophisticated-accent font-semibold mb-3">Filosofia Editorial</h2>
        <p className="text-lg font-light italic leading-relaxed text-sophisticated-gray">
          "A moda passa, o estilo permanece imutável nas entrelinhas da sofisticação."
        </p>
      </div>
    </div>
  );
}