import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, BarChart2, PackageCheck, Edit2, X } from 'lucide-react';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null); 
  
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    category: 'Calças', 
    image_url: '', 
    model_photo: '', 
    model_size: '', 
    sizes: '', // Grade de tamanhos em string para o input
    stock: '' 
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    // 1. Busca todos os produtos do catálogo para listar na grade
    const prodRes = await supabase.from('products').select('*');
    if (prodRes.data) setProducts(prodRes.data);

    // 2. Busca os pedidos com e-mail do cliente e os itens com tamanho selecionado
    const orderRes = await supabase
      .from('orders')
      .select('*, profiles(email), order_items(*, products(*))');
    if (orderRes.data) setOrders(orderRes.data);
  }

  const startEdit = (product) => {
    setEditingProductId(product.id);
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'Calças',
      image_url: Array.isArray(product.image_url) ? product.image_url.join(', ') : product.image_url || '',
      model_photo: product.model_photo || '',
      model_size: product.model_size || '',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '', 
      stock: product.stock || ''
    });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setForm({ 
      title: '', 
      description: '', 
      price: '', 
      category: 'Calças', 
      image_url: '', 
      model_photo: '', 
      model_size: '', 
      sizes: '', 
      stock: '' 
    });
  };

  async function handleSaveProduct(e) {
    e.preventDefault();
    const imagesArray = form.image_url.split(',').map(url => url.trim()).filter(url => url !== '');
    const sizesArray = form.sizes.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== '');
    
    const productData = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image_url: imagesArray,
      model_photo: form.model_photo,
      model_size: form.model_size,
      sizes: sizesArray, 
      stock: parseInt(form.stock)
    };

    if (editingProductId) {
      const { error } = await supabase
        .from('products')
        .update([productData])
        .eq('id', editingProductId);

      if (!error) {
        alert("Anúncio updated com sucesso!");
        cancelEdit();
        fetchAdminData();
      } else {
        alert("Erro ao atualizar o anúncio.");
      }
    } else {
      const { error } = await supabase.from('products').insert([productData]);

      if (!error) {
        alert("Peça catalogada com sucesso.");
        cancelEdit();
        fetchAdminData();
      }
    }
  }

  async function handleUpdateOrderStatus(orderId, newStatus) {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      alert(`Pedido atualizado para: ${newStatus}`);
      fetchAdminData(); 
    } else {
      alert("Erro ao atualizar status.");
    }
  }

  const totalFaturamento = orders.reduce((acc, curr) => acc + parseFloat(curr.total), 0);
  const totalPecasVendidas = orders.flatMap(o => o.order_items || []).reduce((acc, curr) => acc + (curr.quantity || 0), 0);

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
            <span className="block text-2xl font-light">{products.reduce((acc,p) => acc + (p.stock || 0), 0)}</span>
            <span className="text-[10px] tracking-widest uppercase opacity-70">Itens em Estoque Global</span>
          </div>
        </div>
      </div>

      {/* Gerenciamento de Pedidos */}
      <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border">
        <h2 className="text-xs uppercase tracking-widest font-bold text-sophisticated-primary mb-4 flex items-center gap-2"><PackageCheck size={14}/> Despacho e Status de Pedidos</h2>
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
          {orders.map(order => (
            <div key={order.id} className="border border-sophisticated-border p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sophisticated-text">
              <div>
                <p className="font-semibold">Pedido: #{order.id.slice(0,8)} - Cliente: <span className="font-normal opacity-80">{order.profiles?.email}</span></p>
                <div className="text-[11px] text-sophisticated-gray mt-1 space-y-1">
                  {order.order_items?.map(item => (
                    <span key={item.id} className="block font-medium">
                      {item.products?.title}
                      {item.size && <span className="text-sophisticated-accent font-bold"> [Tam: {item.size}]</span>}
                      <span className="text-sophisticated-gray font-normal"> (x{item.quantity})</span>
                    </span>
                  ))}
                </div>
                <p className="mt-2 font-medium">Total: R$ {parseFloat(order.total || 0).toFixed(2)}</p>
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
        {/* Formulário Interativo */}
        <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-sophisticated-primary flex items-center gap-1">
              <Plus size={14}/> {editingProductId ? 'Editar Anúncio da Peça' : 'Catalogar Nova Peça'}
            </h2>
            {editingProductId && (
              <button onClick={cancelEdit} className="text-red-600 hover:text-red-800 flex items-center gap-1 bg-transparent border-none cursor-pointer font-medium">
                <X size={14}/> Cancelar Edição
              </button>
            )}
          </div>
          
          <form onSubmit={handleSaveProduct} className="space-y-3">
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
                <option value="Calças">Calças</option>
                <option value="Vestidos">Vestidos</option>
                <option value="Casacos">Casacos</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Blusas">Blusas</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Estoque Global</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" required />
              </div>
              <div>
                <label className="block mb-1">Grade de Tamanhos (Separados por vírgula)</label>
                <input type="text" value={form.sizes} onChange={e => setForm({...form, sizes: e.target.value})} className="w-full border p-2 bg-transparent focus:outline-none" placeholder="Ex: P, M, G, GG" required />
              </div>
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
            <button type="submit" className="w-full bg-sophisticated-primary text-white py-3 uppercase tracking-widest font-medium text-xs hover:opacity-90 transition cursor-pointer border-none">
              {editingProductId ? 'Salvar Alterações no Anúncio' : 'Publicar no Catálogo'}
            </button>
          </form>
        </div>

        {/* Grade de Itens Ativos */}
        <div className="bg-white dark:bg-neutral-900 p-6 border border-sophisticated-border h-[515px] overflow-y-auto">
          <h2 className="text-xs uppercase tracking-widest font-bold mb-4">Grade de Itens Ativos</h2>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex justify-between items-center border-b pb-2 gap-4">
                <div>
                  <p className="font-medium text-sophisticated-text uppercase">{p.title}</p>
                  <p className="text-[10px] text-sophisticated-gray">R$ {parseFloat(p.price || 0).toFixed(2)}</p>
                  <p className="text-[9px] text-sophisticated-accent tracking-wider uppercase">Tamanhos: {Array.isArray(p.sizes) ? p.sizes.join(', ') : 'Nenhum'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => startEdit(p)} className="p-1 text-sophisticated-gray hover:text-sophisticated-primary dark:hover:text-sophisticated-accent transition bg-transparent border-none cursor-pointer flex items-center gap-1" title="Editar Anúncio">
                    <Edit2 size={13} /> <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Editar</span>
                  </button>
                  <div className="text-right min-w-[85px]">
                    <span className={`px-2 py-1 font-semibold rounded-xs block text-center ${
                      (p.stock ?? 0) === 0 
                        ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-400' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                    }`}>
                      Estoque: {p.stock ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <p className="text-sophisticated-gray text-center py-8">Nenhum produto cadastrado no catálogo ativo.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}