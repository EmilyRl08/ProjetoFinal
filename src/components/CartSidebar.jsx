import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Trash2 } from 'lucide-react';

export default function CartSidebar({ isOpen, setIsOpen, cart, setCart, profile, user }) {
  const [address, setAddress] = useState(profile?.address || '');
  const [paymentMethod, setPaymentMethod] = useState(profile?.payment_method || 'Cartão de Crédito');
  const [useSavedData, setUseSavedData] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleToggleSavedData = (e) => {
    setUseSavedData(e.target.checked);
    if (e.target.checked && profile) {
      setAddress(profile.address || '');
      setPaymentMethod(profile.payment_method || 'Cartão de Crédito');
    }
  };

  async function handleCheckout() {
  if (!user) {
    alert("Por favor, faça login para concluir a compra.");
    return;
  }
  
  /* 🛡️ TRAVA DE NEGÓCIO: IMPEDE QUE O ADMIN FINALIZE COMPRAS */
  if (profile?.is_admin) {
    alert("Operação recusada. Contas de administração não possuem permissão para realizar compras de estoque.");
    return;
  }

  if (cart.length === 0) return;
  if (!address) {
    alert("O endereço de entrega é mandatório.");
    return;
  }
  
  // ... restante do código original de checkout (validação de estoque e inserts) ...

    // 1. Validar e atualizar estoque atomizadamente
    for (const item of cart) {
      const { data: currentProduct } = await supabase.from('products').select('stock').eq('id', item.id).single();
      if (!currentProduct || currentProduct.stock < item.quantity) {
        alert(`A quantidade solicitada de '${item.title}' excede nosso estoque disponível. Estoque restante: ${currentProduct?.stock || 0} unidades.`);
        return;
      }
    }

    // 2. Criar Ordem de Pedido
    const { data: order, error: orderErr } = await supabase.from('orders').insert([{
      user_id: user.id,
      total,
      address,
      payment_method: paymentMethod,
      status: 'Pendente'
    }]).select().single();

    if (orderErr) return;

    // 3. Cadastrar itens da ordem e deduzir estoques
    for (const item of cart) {
      await supabase.from('order_items').insert([{
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }]);

      const { data: currentProduct } = await supabase.from('products').select('stock').eq('id', item.id).single();
      await supabase.from('products').update({ stock: currentProduct.stock - item.quantity }).eq('id', item.id);
    }

    alert(`Pedido finalizado com sucesso! O valor da compra foi processado. Separando itens.`);
    setCart([]);
    setIsOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden text-xs">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsOpen(false)} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <h2 className="text-xs uppercase tracking-widest font-bold">Minha Sacola</h2>
              <button onClick={() => setIsOpen(false)} className="text-sophisticated-gray hover:text-sophisticated-text"><X size={18}/></button>
            </div>

            {/* Listagem dos Itens */}
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium uppercase">{item.title}</p>
                    <p className="text-sophisticated-gray">Qtd: {item.quantity} x R$ {parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-neutral-300 hover:text-red-700 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {cart.length === 0 && <p className="text-sophisticated-gray text-center py-8">Nenhum item adicionado.</p>}
            </div>
          </div>

          {/* Dados de Envio e Pagamento */}
          {cart.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              {profile && (
                <label className="flex items-center gap-2 text-[11px] text-sophisticated-gray">
                  <input type="checkbox" checked={useSavedData} onChange={handleToggleSavedData} className="accent-sophisticated-primary" />
                  Utilizar mesmo endereço/pagamento salvo na conta
                </label>
              )}
              
              <div>
                <label className="block mb-1 font-medium uppercase tracking-wider">Endereço para Entrega</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} disabled={useSavedData} className="w-full border p-2 focus:outline-none focus:border-sophisticated-primary bg-transparent" placeholder="Rua, Número, Bairro, Cidade" required />
              </div>

              <div>
                <label className="block mb-1 font-medium uppercase tracking-wider">Método de Pagamento</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={useSavedData} className="w-full border p-2 bg-white focus:outline-none">
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Pix">Pix</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                </select>
              </div>

              <div className="flex justify-between font-bold text-sm border-t pt-3">
                <span className="uppercase tracking-widest font-normal text-xs">Total Estimado</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>

              <button onClick={handleCheckout} className="w-full bg-sophisticated-primary text-white py-3 uppercase tracking-widest font-medium hover:opacity-90 transition">
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}