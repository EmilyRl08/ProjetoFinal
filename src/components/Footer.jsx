import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-sophisticated-border bg-white mt-20 py-12 text-xs tracking-wider text-sophisticated-gray">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-sophisticated-text font-medium uppercase mb-4">Maison E-commerce</h3>
          <p className="leading-relaxed">Design atemporal, sofisticação e cortes precisos para o guarda-roupa contemporâneo.</p>
        </div>
        <div>
          <h3 className="text-sophisticated-text font-medium uppercase mb-4">Suporte</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-sophisticated-primary transition">Políticas de Devolução</a></li>
            <li><a href="#" className="hover:text-sophisticated-primary transition">Rastreamento de Pedido</a></li>
            <li><a href="#" className="hover:text-sophisticated-primary transition">Guia de Tamanhos</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sophisticated-text font-medium uppercase mb-4">Contato</h3>
          <p>atendimento@maison.com</p>
          <p className="mt-2">São Paulo, SP</p>
        </div>
      </div>
      <div className="text-center mt-12 pt-8 border-t border-neutral-100 text-[11px]">
        &copy; 2026 Maison. Todos os direitos reservados. Desenvolvimento de Alta Costura Digital.
      </div>
    </footer>
  );
}