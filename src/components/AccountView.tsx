'use client';

import { useState } from 'react';
import { LogOut, Mail, ShieldCheck, Crown, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types/music';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signInWithGoogle,
  signOutSupabase,
  signUpWithEmail,
} from '@/lib/supabase';

interface AccountViewProps {
  user: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onUpgradePlan: () => void;
}

export function AccountView({
  user,
  onLogin,
  onLogout,
  onUpgradePlan,
}: AccountViewProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthError(null);

    if (isSupabaseConfigured) {
      setLoading(true);
      const res = isRegister
        ? await signUpWithEmail(email.trim(), password, name.trim())
        : await signInWithEmail(email.trim(), password);
      setLoading(false);
      if (res.error || !res.user) {
        setAuthError(res.error || 'Erro ao autenticar.');
        return;
      }
      onLogin(res.user);
      return;
    }

    onLogin({
      id: `user-${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      provider: 'email',
      plan: 'free',
    });
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    if (isSupabaseConfigured) {
      setLoading(true);
      const res = await signInWithGoogle();
      setLoading(false);
      if (res.error) {
        setAuthError(res.error);
      }
      return;
    }

    onLogin({
      id: `google-${Date.now()}`,
      name: 'Músico Católico (Google)',
      email: 'musico@paroquia.org',
      provider: 'google',
      plan: 'free',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Conta &amp; Planos</h1>
          <p className="page-subtitle">
            Acesse seu acervo sincronizado via Google ou e-mail e gerencie sua assinatura.
          </p>
        </div>
      </div>

      {user ? (
        <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user.name}</span>
              <span className={`tag ${user.plan === 'premium' ? 'tag-gold' : ''}`}>
                {user.plan === 'premium' ? 'Plano Premium' : 'Plano Gratuito'}
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-soft)', marginTop: '0.2rem' }}>
              {user.email} • Login via {user.provider === 'google' ? 'Google' : 'E-mail e senha'}
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={async () => {
              await signOutSupabase();
              onLogout();
            }}
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.35rem', maxWidth: '460px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            {isRegister ? 'Criar conta gratuita' : 'Entrar no MissaChord'}
          </h2>

          {authError && (
            <div className="alert alert-error" style={{ marginBottom: '0.85rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="button"
            className="btn"
            style={{ width: '100%', marginBottom: '1rem', fontWeight: 600 }}
            onClick={handleGoogleAuth}
            disabled={loading}
          >
            Continuar com Google
          </button>

          <div
            style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              color: 'var(--text-soft)',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border)',
              lineHeight: '0.1em',
            }}
          >
            <span style={{ background: 'var(--surface)', padding: '0 0.6rem' }}>ou com e-mail</span>
          </div>

          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isRegister && (
              <input
                type="text"
                className="input"
                placeholder="Seu nome ou ministério"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              <Mail size={16} /> {isRegister ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            style={{
              marginTop: '0.85rem',
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
            onClick={() => setIsRegister((r) => !r)}
          >
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      )}

      {/* Plans Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Plano Gratuito</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            R$ 0 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-soft)' }}>/mês</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--success)' }} /> Até 50 músicas em ChordPro</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--success)' }} /> Transposição rápida de tom</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--success)' }} /> Categorização múltipla e estrelas</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--success)' }} /> 5 importações por URL/mês</li>
          </ul>
        </div>

        <div
          className="card"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderColor: 'var(--gold)',
            background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 45%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.1rem', color: '#92400e' }}>
            <Crown size={18} /> Plano Ministério Premium
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            R$ 19,90 <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-soft)' }}>/mês</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--gold)' }} /> Músicas e setlists ilimitados</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--gold)' }} /> Modo Offline completo na igreja</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--gold)' }} /> Importação ilimitada via URL + IA</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--gold)' }} /> Sincronização ao vivo com a equipe</li>
            <li><Check size={14} style={{ display: 'inline', color: 'var(--gold)' }} /> Exportação em PDF diagramado</li>
          </ul>
          <button
            type="button"
            className="btn btn-gold"
            onClick={onUpgradePlan}
            disabled={user?.plan === 'premium'}
          >
            {user?.plan === 'premium' ? 'Você já é Premium' : 'Ativar Teste Premium'}
          </button>
        </div>
      </div>
    </div>
  );
}
