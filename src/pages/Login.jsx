import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Cria o usuário no sistema de Autenticação do Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password: password 
        });

        if (signUpError) throw signUpError;

        // Verifica se o usuário foi retornado com sucesso (algumas configs do Supabase exigem confirmação por e-mail antes)
        const user = data?.user;
        
        if (user) {
          // 2. Insere os dados na tabela customizada 'profiles' de forma segura
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
              id: user.id, 
              email: user.email 
            });

          if (profileError) {
            console.error("Erro ao criar perfil na tabela:", profileError.message);
          }
          
          alert("Cadastro realizado com sucesso! Se configurado, verifique seu e-mail ou tente fazer o login.");
          setIsSignUp(false);
        } else {
          alert("Cadastro solicitado! Verifique sua caixa de e-mail para confirmar o acesso.");
          setIsSignUp(false);
        }

      } else {
        // Fluxo de Login Tradicional
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password: password 
        });
        
        if (signInError) throw signInError;
      }
    } catch (err) {
      alert(`Erro no processo: ${err.message || err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-sophisticated-border p-8 mt-12 text-xs page-transition">
      <h2 className="text-center uppercase tracking-[0.2em] font-medium text-sophisticated-primary mb-6 text-sm">
        {isSignUp ? 'Criar Nova Credencial' : 'Acessar Conta'}
      </h2>
      
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block uppercase tracking-wider mb-1 font-medium text-sophisticated-text">E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border border-sophisticated-border p-2.5 bg-transparent focus:outline-none focus:border-sophisticated-primary text-sophisticated-text" 
            required 
            disabled={loading}
          />
        </div>
        <div>
          <label className="block uppercase tracking-wider mb-1 font-medium text-sophisticated-text">Senha</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full border border-sophisticated-border p-2.5 bg-transparent focus:outline-none focus:border-sophisticated-primary text-sophisticated-text" 
            required 
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-sophisticated-primary text-white py-3 uppercase tracking-widest font-medium hover:opacity-90 transition disabled:bg-neutral-300"
        >
          {loading ? 'Processando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-sophisticated-gray">
        <button 
          onClick={() => setIsSignUp(!isSignUp)} 
          className="hover:underline bg-transparent border-none cursor-pointer"
          disabled={loading}
        >
          {isSignUp ? 'Já possui cadastro? Faça Login' : 'Não possui conta? Crie uma aqui'}
        </button>
      </div>
    </div>
  );
}