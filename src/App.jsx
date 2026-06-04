import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Header from "./components/Header";
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import CartSidebar from './components/CartSidebar';

export default function App() {
  const [currentTab, setCurrentTab] = useState('inicio');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert(`Quantidade limite excedida. Estoque atual: ${product.stock} unidades.`);
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      if (product.stock < 1) {
        alert("Produto sem estoque disponível.");
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-sophisticated-bg text-sophisticated-text selection:bg-sophisticated-primary selection:text-white">
      <Header 
        setCurrentTab={setCurrentTab} 
        currentTab={currentTab} 
        setIsCartOpen={setIsCartOpen} 
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        profile={profile}
        setSearchQuery={setSearchQuery}
      />
      
    
<main className="flex-grow container mx-auto px-4 py-8 page-transition" key={currentTab}>
  {currentTab === 'inicio' && <Home addToCart={addToCart} setCurrentTab={setCurrentTab} />}
  {currentTab === 'produtos' && <Products addToCart={addToCart} searchQuery={searchQuery} />}
  {currentTab === 'perfil' && (user ? <Dashboard user={user} profile={profile} fetchProfile={fetchProfile} /> : <Login />)}
  {currentTab === 'admin' && (profile?.is_admin ? <Admin /> : <div className="text-center py-20 text-sophisticated-gray">Acesso Restrito à Administração.</div>)}
</main>
      <Footer />
      
      <CartSidebar 
        isOpen={isCartOpen} 
        setIsOpen={setIsCartOpen} 
        cart={cart} 
        setCart={setCart} 
        profile={profile} 
        user={user}
      />
    </div>
  );
}