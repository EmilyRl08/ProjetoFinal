import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Star, ShieldAlert } from 'lucide-react';

export default function Products({ addToCart, searchQuery }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [reviews, setReviews] = useState({});
  const [quantities, setQuantities] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({}); // 🌟 Estado para salvar o tamanho selecionado de cada produto

  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600';

  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, [category, searchQuery]);

  async function fetchProducts() {
    let query = supabase.from('products').select('*');
    if (category !== 'Todos') query = query.eq('category', category);
    
    const { data } = await query;
    if (data) {
      const termoBusca = (searchQuery || '').toLowerCase();
      const filtered = data.filter(p => (p.title || '').toLowerCase().includes(termoBusca));
      setProducts(filtered);
    }
  }

  async function fetchReviews() {
    try {
      const { data, error } = await supabase.from('reviews').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.product_id]) acc[curr.product_id] = [];
          acc[curr.product_id].push(curr);
          return acc;
        }, {});
        setReviews(grouped);
      } else {
        setReviews({});
      }
    } catch (err) {
      console.error("Aviso ao carregar avaliações:", err.message);
      setReviews({});
    }
  }

  const getAverageRating = (productId) => {
    const prodReviews = reviews[productId];
    if (!prodReviews || prodReviews.length === 0) return 0;
    const sum = prodReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / prodReviews.length).toFixed(1);
  };

  const increaseQuantity = (id, maxStock) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      if (current >= maxStock) return prev;
      return { ...prev, [id]: current + 1 };
    });
  };

  const decreaseQuantity = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) - 1)
    }));
  };

  const selectSize = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const tratarLinkImagem = (campoBanco) => {
    if (!campoBanco) return '';
    let linkLimpo = '';
    if (Array.isArray(campoBanco) && campoBanco.length > 0) {
      linkLimpo = campoBanco[0];
    } else if (typeof campoBanco === 'string') {
      linkLimpo = campoBanco.replace(/[\[\]"'{}]/g, '').split(',')[0].trim();
    }
    if (linkLimpo.includes('google.com/imgres')) {
      try {
        const urlParams = new URLSearchParams(linkLimpo.substring(linkLimpo.indexOf('?')));
        const linkEscondido = urlParams.get('imgurl');
        if (linkEscondido) linkLimpo = decodeURIComponent(linkEscondido);
      } catch (err) {
        console.error("Erro ao decodificar link do Google:", err);
      }
    }
    return linkLimpo;
  };

  return (
    <div className="page-transition">
      {/* Subheader / Filtros */}
      <div className="border-b border-sophisticated-border pb-6 mb-10 flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4 overflow-x-auto text-xs uppercase tracking-widest font-medium">
          {['Todos', 'Calças', 'Vestidos', 'Casacos', 'Acessórios', 'Blusas'].map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`pb-2 transition-all whitespace-nowrap bg-transparent border-none cursor-pointer ${category === cat ? 'text-sophisticated-primary border-b-2 border-sophisticated-primary font-bold' : 'text-sophisticated-gray hover:text-sophisticated-text'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="text-xs text-sophisticated-gray tracking-wider">
          {products.length} peças encontradas
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
        {products.map((product) => {
          const avgRating = getAverageRating(product.id);
          const primaryImage = tratarLinkImagem(product.image_url) || FALLBACK_IMAGE;
          const hoverImage = tratarLinkImagem(product.model_photo);

          const stockDisponivel = product.stock ?? 10;
          const esgotado = stockDisponivel <= 0;
          const qtdSelecionada = quantities[product.id] || 1;
          const tamanhoEscolhido = selectedSizes[product.id];
          const listaTamanhos = Array.isArray(product.sizes) ? product.sizes : [];

          return (
            <div key={product.id} className="group relative flex flex-col justify-between h-full">
              <div>
                {/* Imagens */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-4 rounded-sm">
                  <img src={primaryImage} alt={product.title} className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" onError={(e) => { e.target.src = FALLBACK_IMAGE; }} />
                  {hoverImage && (
                    <img src={hoverImage} alt="Modelo" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  {stockDisponivel <= 3 && stockDisponivel > 0 && (
                    <div className="absolute top-2 left-2 bg-sophisticated-accent text-white text-[10px] uppercase tracking-widest px-2 py-1 font-medium flex items-center gap-1 z-10">
                      <ShieldAlert size={10} /> Últimas {stockDisponivel} peças
                    </div>
                  )}
                  {esgotado && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center text-xs uppercase tracking-widest font-medium text-sophisticated-primary z-10">
                      Esgotado
                    </div>
                  )}
                </div>

                {/* Título e Preço */}
                <div className="flex justify-between items-start mb-1 text-sophisticated-text">
                  <h3 className="text-xs font-medium tracking-wide uppercase group-hover:text-sophisticated-primary transition">{product.title}</h3>
                  <span className="text-xs tracking-wider font-semibold">R$ {parseFloat(product.price || 0).toFixed(2)}</span>
                </div>

                {product.description && <p className="text-[11px] text-sophisticated-gray tracking-wide mb-2 line-clamp-2 italic">{product.description}</p>}
                {product.model_size && <p className="text-[11px] text-sophisticated-gray tracking-wide mb-1">Modelo veste: {product.model_size}</p>}
                <p className={`text-[11px] tracking-wide mb-2 ${esgotado ? 'text-red-600' : 'text-sophisticated-gray'}`}>{esgotado ? 'Item indisponível' : `Disponível: ${stockDisponivel} un.`}</p>

                {/* 🌟 NOVO SELETOR: Escolha de Tamanhos de Alta Costura */}
                {!esgotado && listaTamanhos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-sophisticated-gray mb-1.5 font-medium">Selecione o Tamanho:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {listaTamanhos.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => selectSize(product.id, size)}
                          className={`w-7 h-7 text-[10px] font-bold tracking-wider flex items-center justify-center border transition-all cursor-pointer ${
                            tamanhoEscolhido === size
                              ? 'bg-sophisticated-primary text-white border-sophisticated-primary'
                              : 'bg-transparent border-neutral-200 dark:border-neutral-700 text-sophisticated-text hover:border-neutral-900 dark:hover:border-white'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[11px] text-sophisticated-gray mb-3">
                  <Star size={12} className={avgRating > 0 ? "fill-sophisticated-accent text-sophisticated-accent" : "text-neutral-300 dark:text-neutral-600"} />
                  <span>{avgRating > 0 ? `${avgRating} de avaliação` : 'Sem avaliações'}</span>
                </div>
              </div>

              {/* Controles de Quantidade */}
              {!esgotado && (
                <div className="flex items-center justify-center gap-4 mb-2 text-xs">
                  <button onClick={() => decreaseQuantity(product.id)} className="w-7 h-7 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 bg-transparent cursor-pointer">-</button>
                  <span className="font-medium min-w-[16px] text-center">{qtdSelecionada}</span>
                  <button onClick={() => increaseQuantity(product.id, stockDisponivel)} className="w-7 h-7 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 bg-transparent cursor-pointer">+</button>
                </div>
              )}

              {/* Botão de Compra Inteligente */}
              <button 
                onClick={() => {
                  if (listaTamanhos.length > 0 && !tamanhoEscolhido) {
                    alert("Por favor, selecione um tamanho de peça antes de adicionar à sacola.");
                    return;
                  }
                  // Envia o produto com o tamanho injetado nas propriedades do item
                  addToCart({ ...product, selected_size: tamanhoEscolhido }, qtdSelecionada);
                }}
                disabled={esgotado}
                className="w-full mt-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-sophisticated-primary hover:text-white dark:hover:bg-sophisticated-primary dark:hover:text-white py-2.5 text-xs uppercase tracking-widest font-medium transition-all border-none cursor-pointer disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:cursor-not-allowed"
              >
                {esgotado ? 'Indisponível' : 'Adicionar à Sacola'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}