import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, BarChart2, PackageCheck } from 'lucide-react';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'Alfaiataria', image_url: '', model_photo: '', model_size: '', stock: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    const prodRes = await supabase.from('products').select('*');
    if (prodRes.data) setProducts(prodRes.data);

    // Busca ordens com e-mail do perfil comprador e itens vinculados
    const orderRes = await supabase.from('orders').select('*, profiles(email), order_items(*, products(*))');
    if (orderRes.data) setOrders(orderRes.data);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const imagesArray = form.image_url.split(',').map(url => url.trim()).filter(url => url !== '');
    
    const { error } = await supabase.from('products').insert([{
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image_url: imagesArray,
      model_photo: form.model_photo,
      model_size: form.model_size,
      stock: parseInt(form.stock)
    }]);

    if (!error) {
      alert("Peça catalogada com sucesso.");
      setForm({ title: '', description: '', price: '', category: 'Alfaiataria', image_url: '', model_photo: '', model_size: '', stock: '' });
      fetchAdminData();
    }
  }

  /* 🚚 FUNÇÃO DO ADMIN PARA ALTERAR STATUS DO PEDIDO DO CLIENTE */
  async function handleUpdateOrderStatus(orderId, newStatus) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      alert(`Pedido atualizado para: ${newStatus}`);
      fetchAdminData(); // Atualiza a tela imediatamente
    } else {
      alert("Erro ao atualizar status.");
    }
  }

  const totalFaturamento = orders.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  const totalPecasVendidas = orders.flatMap(o => o.order_items).reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-12 text-xs page-transition">
      {/* Relatório de Vendas */}
      <div className="bg-neutral-900 text-white p-6 rounded-sm">
        <h2 className="text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2 mb-6 text-sophisticated-accent"><BarChart2 size={16}/> Relatório de Vendas & Desempenho</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l border-sophisticated-accent pl-4">
            <span className="block text-2xl font-light">R$ {totalFaturamento.toFixed(2)}</span>
            <span className="text-[10px] tracking-widest uppercase opacity-70">Faturamento Líquido</span>
          </div>
          <div className="border-l border-sophisticated-accent pl-4">
            <span className="block text-2xl font-light">{totalPecasVendidas}</span>
            <span className="text-[10px] tracking-widest uppercase opacity-70">Peças Despachadas</span>
          </div>
          <div className="border-l border-sophisticated-accent pl-4">
            <span className="block text-2xl font-light">{products.reduce((acc,p) => acc + p.stock, 0)}</span>
            <span className="text-[10px] tracking-widest uppercase opacity-70">Itens em Estoque Global</span>
          </div>
        </div>
      </div>

      {/* 📦 NOVO CONTROLE: Gerenciamento Flutuante de Pedidos dos Clientes */}
      <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border">
        <h2 className="text-xs uppercase tracking-widest font-bold text-sophisticated-primary mb-4 flex items-center gap-2"><PackageCheck size={14}/> Despacho e Status de Pedidos</h2>
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {orders.map(order => (
            <div key={order.id} className="border border-sophisticated-border p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sophisticated-text">
              <div>
                <p className="font-semibold">Pedido: #{order.id.slice(0,8)} - Cliente: <span className="font-normal opacity-80">{order.profiles?.email}</span></p>
                <div className="text-[11px] text-sophisticated-gray mt-1">
                  {order.order_items?.map(item => (
                    <span key={item.id} className="block">{item.products?.title} (x{item.quantity})</span>
                  ))}
                </div>
                <p className="mt-2 font-medium">Total: R$ {parseFloat(order.total).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`uppercase font-bold text-[10px] tracking-wider px-2 py-1 ${order.status === 'Entregue' ? 'bg-green-50 text-green-800' : order.status === 'Devolvido' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
                  {order.status}
                </span>
                <select 
                  value={order.status} 
                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  className="p-1.5 border border-sophisticated-border bg-white dark:bg-neutral-800 focus:outline-none rounded-xs"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Devolvido">Devolvido</option>
                </select>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sophisticated-gray py-4 text-center">Nenhuma ordem de venda registrada.</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Formulário de Cadastro */}
        <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border">
          <h2 className="text-xs uppercase tracking-widest font-bold text-sophisticated-primary mb-4 flex items-center gap-1"><Plus size={14}/> Catalogar Nova Peça</h2>
          <form onSubmit={handleAddProduct} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Título do Produto</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" required />
              </div>
              <div>
                <label className="block mb-1">Preço (R$)</label>
                <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" required />
              </div>
            </div>
            <div>
              <label className="block mb-1">Categoria</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border p-2 bg-white dark:bg-neutral-800 focus:outline-none">
                <option value="Alfaiataria">Alfaiataria</option>
                <option value="Vestidos">Vestidos</option>
                <option value="Casacos">Casacos</option>
                <option value="Acessórios">Acessórios</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Estoque Inicial</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" required />
            </div>
            <div>
              <label className="block mb-1">Links das Fotos (Separadas por vírgula)</label>
              <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" placeholder="http://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Foto da Modelo (Hover)</label>
                <input type="text" value={form.model_photo} onChange={e => setForm({...form, model_photo: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" />
              </div>
              <div>
                <label className="block mb-1">Tamanho da Modelo</label>
                <input type="text" value={form.model_size} onChange={e => setForm({...form, model_size: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" placeholder="Ex: P" />
              </div>
            </div>
            <div>
              <label className="block mb-1">Descrição Curta Editorial</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 h-20 bg-transparent focus:outline-none" required />
            </div>
            <button type="submit" className="w-full bg-sophisticated-primary text-white py-3 uppercase tracking-widest font-medium text-xs hover:opacity-90 transition">
              Publicar no Catálogo
            </button>
          </form>
        </div>

        {/* Grade de Itens Ativos */}
        <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border h-[515px] overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest font-bold mb-4">Grade de Itens Ativos</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-sophisticated-text uppercase">{p.title}</p>
                  <p className="text-[10px] text-sophisticated-gray">R$ {parseFloat(p.price).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 font-semibold ${p.stock === 0 ? 'bg-red-50 text-red-800' : 'bg-neutral-100 dark:bg-neutral-800 text-sophisticated-text'}`}>
                    Estoque: {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}