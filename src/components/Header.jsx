import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Settings, User, Sun, Moon } from 'lucide-react';

export default function Header({ setCurrentTab, currentTab, setIsCartOpen, cartCount, profile, setSearchQuery }) {
  // Estado para controlar o modo escuro manualmente
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <header className="border-b border-sophisticated-border bg-white dark:bg-neutral-900 sticky top-0 z-40 transition-colors">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Logotipo */}
        <div 
          className="text-2xl font-bold tracking-[0.25em] text-sophisticated-primary cursor-pointer transition-transform hover:scale-102" 
          onClick={() => setCurrentTab('inicio')}
        >
          MAISON
        </div>
        
        {/* Navegação */}
        <nav className="hidden md:flex space-x-8 uppercase text-[11px] tracking-[0.2em] font-semibold">
          <button 
            onClick={() => setCurrentTab('inicio')} 
            className={`hover:text-sophisticated-primary transition-all py-2 ${currentTab === 'inicio' ? 'text-sophisticated-primary border-b-2 border-sophisticated-primary' : 'text-sophisticated-gray'}`}
          >
            Início
          </button>
          <button 
            onClick={() => { setCurrentTab('produtos'); setSearchQuery(''); }} 
            className={`hover:text-sophisticated-primary transition-all py-2 ${currentTab === 'produtos' ? 'text-sophisticated-primary border-b-2 border-sophisticated-primary' : 'text-sophisticated-gray'}`}
          >
            Produtos
          </button>
          <button 
            onClick={() => setCurrentTab('perfil')} 
            className={`hover:text-sophisticated-primary transition-all py-2 ${currentTab === 'perfil' ? 'text-sophisticated-primary border-b-2 border-sophisticated-primary' : 'text-sophisticated-gray'}`}
          >
            Perfil
          </button>
          
          {/* O BOTÃO ADMIN APARECERÁ AQUI */}
          {profile?.is_admin && (
            <button 
              onClick={() => setCurrentTab('admin')} 
              className={`text-sophisticated-accent hover:opacity-80 transition flex items-center gap-1 py-2 ${currentTab === 'admin' ? 'border-b-2 border-sophisticated-accent' : ''}`}
            >
              <Settings size={13} /> Admin
            </button>
          )}
        </nav>

        {/* Barra de Ações */}
        <div className="flex items-center space-x-6">
          <div className="relative flex items-center border-b border-sophisticated-border py-1">
            <input 
              type="text" 
              placeholder="Buscar..." 
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentTab('produtos'); }}
              className="bg-transparent text-xs tracking-wide focus:outline-none placeholder:text-neutral-400 text-sophisticated-text w-24 md:w-32"
            />
            <Search size={14} className="text-sophisticated-gray ml-2" />
          </div>

          {/* 🌓 BOTÃO ALTERNAR CLARO / ESCURO */}
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="p-1 text-sophisticated-text hover:text-sophisticated-primary transition"
            title="Alternar Tema"
          >
            {darkMode ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
          </button>
          
          {/* Botão de Conta / Login Dinâmico */}
          <button 
            onClick={() => setCurrentTab('perfil')}
            className={`flex items-center gap-1.5 p-1 text-xs uppercase tracking-widest font-medium transition ${currentTab === 'perfil' ? 'text-sophisticated-primary font-bold' : 'text-sophisticated-text hover:text-sophisticated-primary'}`}
          >
            <User size={18} strokeWidth={1.8} className={profile ? "text-sophisticated-primary" : ""} />
            <span className="hidden lg:inline text-[10px]">{profile ? 'Painel' : 'Entrar'}</span>
          </button>
          
          {/* Sacola */}
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="relative p-1 text-sophisticated-text hover:text-sophisticated-primary transition"
          >
            <ShoppingBag size={18} strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-sophisticated-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}