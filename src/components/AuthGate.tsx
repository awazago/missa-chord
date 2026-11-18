'use client';

import { useState } from 'react';
import { ListMusic, Mail, Sparkles, SlidersHorizontal, Star, Link2, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types/music';
import {
  isSupabaseConfigured,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from '@/lib/supabase';

interface AuthGateProps {
  onLogin: (user: UserProfile) => void;
}

export function AuthGate({ onLogin }: AuthGateProps) {
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
      name: 'Músico (Google)',
      email: 'musico@chordset.app',
      provider: 'google',
      plan: 'free',
    });
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '940px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        {/* Left: Value Proposition */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <span className="brand-mark" style={{ width: '44px', height: '44px' }}>
              <ListMusic size={22} />
            </span>
            <div>
              <div className="brand-name" style={{ fontSize: '1.55rem' }}>
                ChordSet
              </div>
              <span className="brand-sub">Acervo &amp; Setlists em ChordPro</span>
            </div>
          </div>

          <h1 className="page-title" style={{ fontSize: '2rem', lineHeight: 1.18 }}>
            Seu caderno de cifras em ChordPro, pronto para cada celebração.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem' }}>
            Organize seu repertório pessoal, mude o tom em segundos antes de tocar e gere setlists inteligentes com base nas suas melhores músicas.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <SlidersHorizontal size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>Transposição instantânea de tom no padrão ChordPro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <Link2 size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>Importação automática via URL ou texto colado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <Star size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>Classificação 1–5 estrelas e múltiplos momentos de uso</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
              <Sparkles size={17} style={{ color: 'var(--gold)', flexShrink: 0 }} />
              <span>Gerador de setlist com Modo Palco PWA para celular e tablet</span>
            </div>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="card" style={{ padding: '1.6rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            {isRegister ? 'Criar sua conta gratuita' : 'Entrar no ChordSet'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '1.1rem' }}>
            Acesse seu acervo privado e seus setlists salvos.
          </p>

          {authError && (
            <div className="alert alert-error" style={{ marginBottom: '0.9rem' }}>
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
                placeholder="Seu nome ou grupo/ministério"
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Mail size={16} /> {isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <button
            type="button"
            style={{
              marginTop: '0.95rem',
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              fontSize: '0.84rem',
              fontWeight: 600,
            }}
            onClick={() => setIsRegister((r) => !r)}
          >
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se grátis'}
          </button>
        </div>
      </div>
    </div>
  );
}
