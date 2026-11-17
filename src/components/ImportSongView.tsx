'use client';

import { useState } from 'react';
import { Link2, FileText, Sparkles, Check, AlertCircle } from 'lucide-react';
import {
  detectKeyFromChordPro,
  textWithChordsAboveToChordPro,
} from '@/lib/chordpro';
import {
  LITURGICAL_SEASON_LABELS,
  LiturgicalSeason,
  MASS_MOMENT_LABELS,
  MassMoment,
  Song,
} from '@/types/music';
import { StarRating } from './StarRating';

interface ImportSongViewProps {
  onSaveSong: (song: Song) => void;
}

export function ImportSongView({ onSaveSong }: ImportSongViewProps) {
  const [mode, setMode] = useState<'url' | 'paste'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [key, setKey] = useState('G');
  const [rawPaste, setRawPaste] = useState('');
  const [chordPro, setChordPro] = useState('');
  const [moments, setMoments] = useState<MassMoment[]>(['entrada']);
  const [seasons, setSeasons] = useState<LiturgicalSeason[]>(['todos']);
  const [rating, setRating] = useState(5);

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Não foi possível extrair a cifra dessa URL.');
        return;
      }
      setTitle(data.title || '');
      setArtist(data.artist || '');
      setKey(data.key || 'C');
      setChordPro(data.chordPro || '');
      setSuccessMsg('Cifra extraída e convertida para ChordPro! Revise os campos e salve.');
    } catch {
      setError('Erro de conexão ao tentar importar a URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertPaste = () => {
    setError(null);
    if (!rawPaste.trim()) {
      setError('Cole o texto da cifra antes de converter.');
      return;
    }
    const converted = textWithChordsAboveToChordPro(rawPaste, {
      title: title || undefined,
      artist: artist || undefined,
      key: key || undefined,
    });
    setChordPro(converted);
    setKey(detectKeyFromChordPro(converted));
    setSuccessMsg('Texto convertido para o padrão ChordPro!');
  };

  const toggleMoment = (m: MassMoment) => {
    setMoments((prev) =>
      prev.includes(m) ? (prev.length > 1 ? prev.filter((x) => x !== m) : prev) : [...prev, m]
    );
  };

  const toggleSeason = (s: LiturgicalSeason) => {
    setSeasons((prev) =>
      prev.includes(s) ? (prev.length > 1 ? prev.filter((x) => x !== s) : prev) : [...prev, s]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !chordPro.trim()) {
      setError('Preencha o título e o conteúdo em ChordPro.');
      return;
    }

    const now = new Date().toISOString();
    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || undefined,
      originalKey: key.trim() || detectKeyFromChordPro(chordPro),
      preferredKey: key.trim() || detectKeyFromChordPro(chordPro),
      chordPro: chordPro.trim(),
      moments,
      seasons,
      rating,
      sourceUrl: mode === 'url' && url.trim() ? url.trim() : undefined,
      createdAt: now,
      updatedAt: now,
    };

    onSaveSong(newSong);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Importar Música para ChordPro</h1>
          <p className="page-subtitle">
            Cole a URL de uma cifra ou o texto com acordes acima da letra para converter automaticamente.
          </p>
        </div>
      </div>

      {/* Mode Switch */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${mode === 'url' ? 'btn-primary' : ''}`}
          onClick={() => setMode('url')}
        >
          <Link2 size={16} /> Importar via URL
        </button>
        <button
          type="button"
          className={`btn ${mode === 'paste' ? 'btn-primary' : ''}`}
          onClick={() => setMode('paste')}
        >
          <FileText size={16} /> Colar Texto da Cifra
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <Check size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{successMsg}</span>
        </div>
      )}

      {mode === 'url' ? (
        <form onSubmit={handleImportUrl} className="card" style={{ padding: '1.1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            URL da música / cifra
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <input
              type="url"
              className="input"
              style={{ flex: 1, minWidth: '240px' }}
              placeholder="https://site-de-cifras.com.br/musica-catolica"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Sparkles size={16} />
              {loading ? 'Extraindo...' : 'Extrair e Converter'}
            </button>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '0.5rem' }}>
            Dica: se algum portal bloquear o acesso automático, copie a cifra na página e use a aba &quot;Colar Texto da Cifra&quot;.
          </p>
        </form>
      ) : (
        <div className="card" style={{ padding: '1.1rem' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Cole a cifra (acordes na linha acima da letra)
          </label>
          <textarea
            className="textarea textarea-mono"
            rows={7}
            placeholder={`Exemplo:\nG        D/F#    Em\nEis-me aqui, Senhor!\nC        D       G\nPra fazer tua vontade`}
            value={rawPaste}
            onChange={(e) => setRawPaste(e.target.value)}
          />
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-primary" onClick={handleConvertPaste}>
              <Sparkles size={16} /> Converter para ChordPro
            </button>
          </div>
        </div>
      )}

      {/* Metadata + ChordPro Preview Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Título da Música *
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Eis-me Aqui, Senhor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Artista / Ministério
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Comunidade Shalom"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tom Original
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ex: G, Am, D"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Sua Classificação
            </label>
            <div style={{ paddingTop: '0.35rem' }}>
              <StarRating value={rating} onChange={setRating} size={22} />
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.45rem' }}>
            Momentos da Missa (pode marcar mais de um)
          </label>
          <div className="tag-row">
            {(Object.keys(MASS_MOMENT_LABELS) as MassMoment[]).map((m) => {
              const active = moments.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  className={`chip ${active ? 'active' : ''}`}
                  onClick={() => toggleMoment(m)}
                >
                  {MASS_MOMENT_LABELS[m]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.45rem' }}>
            Tempos Litúrgicos Compatíveis
          </label>
          <div className="tag-row">
            {(Object.keys(LITURGICAL_SEASON_LABELS) as LiturgicalSeason[]).map((s) => {
              const active = seasons.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  className={`chip ${active ? 'active' : ''}`}
                  onClick={() => toggleSeason(s)}
                >
                  {LITURGICAL_SEASON_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Conteúdo ChordPro *
          </label>
          <textarea
            className="textarea textarea-mono"
            rows={10}
            placeholder="{title: Nome da Música}&#10;{key: G}&#10;&#10;[G]Eis-me a[D/F#]qui, Se[Em]nhor!"
            value={chordPro}
            onChange={(e) => setChordPro(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            <Check size={16} /> Salvar no Acervo
          </button>
        </div>
      </form>
    </div>
  );
}
