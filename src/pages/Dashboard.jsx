import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Star, CornerUpLeft, LogOut } from 'lucide-react';

export default function Dashboard({ user, profile, fetchProfile }) {
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [address, setAddress] = useState(profile?.address || '');
  const [paymentMethod, setPaymentMethod] = useState(profile?.payment_method || 'Cartão de Crédito');
  const [reviewForm, setReviewForm] = useState({ product_id: '', rating: 5, comment: '' });

  useEffect(() => {
    fetchOrders();
    fetchFavorites();
  }, [user]);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*, order_items(*, products(*))').eq('user_id', user.id);
    if (data) setOrders(data);
  }

  async function fetchFavorites() {
    const { data } = await supabase.from('favorites').select('*, products(*)').eq('user_id', user.id);
    if (data) setFavorites(data);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    const { error } = await supabase.from('profiles').update({ address, payment_method: paymentMethod }).eq('id', user.id);
    if (!error) {
      alert("Informações de cadastro atualizadas.");
      fetchProfile(user.id);
    }
  }

  async function handleRequestReturn(orderId) {
    const { error } = await supabase.from('orders').update({ status: 'Devolvido' }).eq('id', orderId);
    if (!error) {
      alert("Solicitação de devolução efetuada com sucesso.");
      fetchOrders();
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    const { error } = await supabase.from('reviews').insert([{
      product_id: reviewForm.product_id,
      user_id: user.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    }]);
    if (!error) {
      alert("Avaliação publicada com sucesso.");
      setReviewForm({ product_id: '', rating: 5, comment: '' });
    }
  }

  /* 🚪 FUNÇÃO CONECTADA AO SUPABASE PARA SAIR DA CONTA */
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(`Erro ao sair: ${error.message}`);
    } else {
      // Força a limpeza total de estados na janela e recarrega na aba inicial
      window.location.reload();
    }
  }

  const boughtProducts = orders.filter(o => o.status === 'Entregue').flatMap(o => o.order_items.map(item => item.products));
  const returnedOrders = orders.filter(o => o.status === 'Devolvido');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Dados Cadastrais */}
      <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border rounded-sm h-fit space-y-6">
        <div>
          <h2 className="text-xs uppercase tracking-widest font-bold text-sophisticated-primary mb-1">Minha Conta</h2>
          <p className="text-xs text-sophisticated-gray mb-4">{user.email}</p>
          
          {/* Botão Sair de Alta Visibilidade */}
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-700 dark:text-red-400 hover:underline text-[11px] uppercase tracking-wider font-medium bg-transparent border-none cursor-pointer p-0"
          >
            <LogOut size={13} /> Encerrar Sessão
          </button>
        </div>
        
        <hr className="border-sophisticated-border" />

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block uppercase tracking-wider mb-1 font-medium text-sophisticated-text">Endereço de Entrega Padrão</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-sophisticated-border p-2.5 bg-transparent focus:outline-none focus:border-sophisticated-primary text-sophisticated-text" required />
          </div>
          <div>
            <label className="block uppercase tracking-wider mb-1 font-medium text-sophisticated-text">Forma de Pagamento Preferencial</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-sophisticated-border p-2.5 bg-white dark:bg-neutral-800 text-sophisticated-text focus:outline-none">
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Pix">Pix</option>
              <option value="Boleto Bancário">Boleto Bancário</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-sophisticated-primary text-white py-2.5 uppercase tracking-widest font-medium text-xs hover:opacity-90 transition">
            Salvar Alterações
          </button>
        </form>
      </div>

{/* Relatórios e Métricas Detalhadas do Cliente */}
<div className="lg:col-span-2 space-y-10">
  <div className="grid grid-cols-3 gap-4 text-center">
    <div className="bg-white dark:bg-neutral-900 border border-sophisticated-border p-4">
      <span className="block text-xl font-light text-sophisticated-text">{orders.length}</span>
      <span className="text-[10px] uppercase tracking-widest text-sophisticated-gray block mt-1">Realizados</span>
    </div>
    <div className="bg-white dark:bg-neutral-900 border border-sophisticated-border p-4">
      <span className="block text-xl font-light text-sophisticated-primary font-bold">
        {orders.filter(o => o.status === 'Pendente').length}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-sophisticated-gray block mt-1">Pendentes</span>
    </div>
    <div className="bg-white dark:bg-neutral-900 border border-sophisticated-border p-4">
      <span className="block text-xl font-light text-green-700 dark:text-green-400 font-bold">
        {orders.filter(o => o.status === 'Entregue').length}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-sophisticated-gray block mt-1">Entregues</span>
    </div>
  </div>
  
  {/* Histórico de Pedidos e Avaliação abaixo continuam os mesmos... */}

        {/* Histórico de Pedidos */}
        <div>
          <h3 className="text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2 text-sophisticated-text"><Package size={14}/> Meus Pedidos</h3>
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white dark:bg-neutral-900 border border-sophisticated-border p-4 text-xs space-y-2">
                <div className="flex justify-between font-semibold border-b border-sophisticated-border pb-2">
                  <span>Código: {order.id.slice(0,8)}</span>
                  <span className={`uppercase tracking-wider ${order.status === 'Devolvido' ? 'text-red-700' : 'text-sophisticated-accent'}`}>{order.status}</span>
                </div>
                {order.order_items.map(item => (
                  <div key={item.id} className="flex justify-between text-sophisticated-gray">
                    <span>{item.products?.title} (x{item.quantity})</span>
                    <span>R$ {parseFloat(item.price).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-medium border-t border-sophisticated-border">
                  <span className="text-sophisticated-text">Total: R$ {parseFloat(order.total).toFixed(2)}</span>
                  {order.status === 'Entregue' && (
                    <button onClick={() => handleRequestReturn(order.id)} className="text-red-800 dark:text-red-400 hover:underline flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <CornerUpLeft size={12}/> Devolver Peça
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Espaço para Avaliação pós-compra */}
        {boughtProducts.length > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-950 p-6 border border-sophisticated-border">
            <h3 className="text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-1 text-sophisticated-text"><Star size={14}/> Avaliar Peças Compradas</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3 text-xs">
              <select onChange={e => setReviewForm({...reviewForm, product_id: e.target.value})} className="w-full p-2 border border-sophisticated-border bg-white dark:bg-neutral-800 text-sophisticated-text focus:outline-none" required>
                <option value="">Selecione o produto adquirido</option>
                {boughtProducts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <div className="flex gap-2 items-center text-sophisticated-text">
                <span>Sua Nota:</span>
                <input type="number" min="1" max="5" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} className="w-16 p-1 border border-sophisticated-border bg-transparent text-center" />
              </div>
              <textarea placeholder="Fale sobre a qualidade do tecido e caimento..." value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full p-2 border border-sophisticated-border h-20 focus:outline-none bg-white dark:bg-neutral-800 text-sophisticated-text" required />
              <button type="submit" className="bg-sophisticated-text dark:bg-neutral-100 dark:text-black text-white px-4 py-2 uppercase tracking-widest text-[11px] hover:bg-sophisticated-primary transition">Enviar Avaliação</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}