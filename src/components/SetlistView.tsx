'use client';

import { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Play,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  LITURGICAL_PRESETS,
  generateMassSetlist,
  slugifySetlistName,
} from '@/lib/liturgy';
import {
  LITURGICAL_SEASON_LABELS,
  LiturgicalSeason,
  MASS_MOMENT_LABELS,
  MassSetlist,
  Song,
} from '@/types/music';
import { ChordProViewer } from './ChordProViewer';
import { StarRating } from './StarRating';

interface SetlistViewProps {
  songs: Song[];
  setlists: MassSetlist[];
  onSaveSetlist: (setlist: MassSetlist) => void;
  onDeleteSetlist: (id: string) => void;
  onUpdateSong: (song: Song) => void;
}

export function SetlistView({
  songs,
  setlists,
  onSaveSetlist,
  onDeleteSetlist,
  onUpdateSong,
}: SetlistViewProps) {
  const [selectedPresetId, setSelectedPresetId] = useState(LITURGICAL_PRESETS[0].id);
  const [customTitle, setCustomTitle] = useState(LITURGICAL_PRESETS[0].title);
  const [customSlug, setCustomSlug] = useState(LITURGICAL_PRESETS[0].slug);
  const [season, setSeason] = useState<LiturgicalSeason>(LITURGICAL_PRESETS[0].season);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [activeSetlistId, setActiveSetlistId] = useState<string | null>(
    setlists[0]?.id ?? null
  );
  const [presentationIndex, setPresentationIndex] = useState<number | null>(null);

  const activeSetlist = setlists.find((s) => s.id === activeSetlistId) ?? null;

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = LITURGICAL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCustomTitle(preset.title);
      setCustomSlug(preset.slug);
      setSeason(preset.season);
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const generated = generateMassSetlist(songs, {
      title: customTitle.trim() || 'Missa Dominical',
      slug: customSlug.trim() || slugifySetlistName(`missa_${customTitle}`),
      date,
      liturgicalDay: customTitle.trim() || 'Liturgia do Dia',
      season,
    });
    onSaveSetlist(generated);
    setActiveSetlistId(generated.id);
    setPresentationIndex(null);
  };

  const handleSwapSong = (itemId: string, newSongId: string) => {
    if (!activeSetlist) return;
    const newSong = songs.find((s) => s.id === newSongId);
    const updated: MassSetlist = {
      ...activeSetlist,
      items: activeSetlist.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              songId: newSongId,
              customKey: newSong?.preferredKey || newSong?.originalKey,
            }
          : item
      ),
      updatedAt: new Date().toISOString(),
    };
    onSaveSetlist(updated);
  };

  // Presentation Mode (Modo Missa)
  if (activeSetlist && presentationIndex !== null) {
    const currentItem = activeSetlist.items[presentationIndex];
    const currentSong = songs.find((s) => s.id === currentItem?.songId);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          className="card"
          style={{
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span className="tag tag-gold" style={{ marginBottom: '0.25rem' }}>
              {currentItem ? MASS_MOMENT_LABELS[currentItem.moment] : 'Missa'} ({presentationIndex + 1}/
              {activeSetlist.items.length})
            </span>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
              {activeSetlist.title}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-sm"
              disabled={presentationIndex === 0}
              onClick={() => setPresentationIndex((i) => (i !== null ? Math.max(0, i - 1) : 0))}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={presentationIndex >= activeSetlist.items.length - 1}
              onClick={() =>
                setPresentationIndex((i) =>
                  i !== null ? Math.min(activeSetlist.items.length - 1, i + 1) : 0
                )
              }
            >
              Próxima <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setPresentationIndex(null)}
            >
              Sair
            </button>
          </div>
        </div>

        {currentSong ? (
          <ChordProViewer song={currentSong} onUpdateSong={onUpdateSong} />
        ) : (
          <div className="alert alert-info">Música não encontrada no acervo.</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 className="page-title">Gerador de Setlist da Missa</h1>
          <p className="page-subtitle">
            Gere o roteiro litúrgico completo com sugestões do seu acervo priorizadas pelas melhores avaliações (★).
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="card" style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Liturgia Base
            </label>
            <select
              className="select"
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              {LITURGICAL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Tempo Litúrgico
            </label>
            <select
              className="select"
              value={season}
              onChange={(e) => setSeason(e.target.value as LiturgicalSeason)}
            >
              {(Object.keys(LITURGICAL_SEASON_LABELS) as LiturgicalSeason[])
                .filter((s) => s !== 'todos')
                .map((s) => (
                  <option key={s} value={s}>
                    {LITURGICAL_SEASON_LABELS[s]}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Data da Celebração
            </label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Nome do Setlist
            </label>
            <input
              type="text"
              className="input"
              value={customTitle}
              onChange={(e) => {
                setCustomTitle(e.target.value);
                setCustomSlug(slugifySetlistName(`missa_${e.target.value}`));
              }}
              placeholder="Ex: 3º Domingo do Tempo Comum"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Identificador (Slug)
            </label>
            <input
              type="text"
              className="input"
              style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '0.84rem' }}
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>
            {season === 'quaresma' || season === 'advento'
              ? 'Regra litúrgica aplicada: Glória omitido automaticamente neste tempo.'
              : 'Ordem ritual completa com sugestão automática por estrelas.'}
          </span>
          <button type="submit" className="btn btn-primary">
            <Sparkles size={16} /> Gerar Setlist Sugerido
          </button>
        </div>
      </form>

      {/* Saved Setlists Selector */}
      {setlists.length > 0 && (
        <div className="chip-scroll">
          {setlists.map((set) => (
            <button
              key={set.id}
              type="button"
              className={`chip ${activeSetlist?.id === set.id ? 'active' : ''}`}
              onClick={() => setActiveSetlistId(set.id)}
            >
              <Calendar size={12} style={{ display: 'inline', marginRight: '0.35rem' }} />
              {set.slug}
            </button>
          ))}
        </div>
      )}

      {/* Active Setlist Detail */}
      {activeSetlist ? (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1rem',
              paddingBottom: '0.85rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-mono), monospace',
                  fontSize: '0.78rem',
                  color: 'var(--gold)',
                  fontWeight: 700,
                }}
              >
                {activeSetlist.slug}
              </div>
              <h2 className="page-title" style={{ fontSize: '1.35rem' }}>
                {activeSetlist.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
                {activeSetlist.date} • {LITURGICAL_SEASON_LABELS[activeSetlist.season]}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setPresentationIndex(0)}
                disabled={activeSetlist.items.length === 0}
              >
                <Play size={16} /> Iniciar Modo Missa
              </button>
              <button
                type="button"
                className="btn"
                style={{ color: 'var(--danger)' }}
                onClick={() => {
                  onDeleteSetlist(activeSetlist.id);
                  setActiveSetlistId(null);
                }}
                title="Excluir Setlist"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activeSetlist.items.map((item, idx) => {
              const song = songs.find((s) => s.id === item.songId);
              const momentOptions = songs
                .filter((s) => s.moments.includes(item.moment))
                .sort((a, b) => b.rating - a.rating);

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ minWidth: '180px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase' }}>
                      {idx + 1}. {MASS_MOMENT_LABELS[item.moment]}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.98rem' }}>
                      {song?.title || 'Música removida'}
                    </div>
                    {song && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                        <span className="key-badge" style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem' }}>
                          {song.preferredKey || song.originalKey}
                        </span>
                        <StarRating value={song.rating} size={13} />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 220px', justifyContent: 'flex-end' }}>
                    <RefreshCw size={14} style={{ color: 'var(--text-soft)' }} />
                    <select
                      className="select"
                      style={{ maxWidth: '280px', padding: '0.4rem 0.6rem', fontSize: '0.84rem' }}
                      value={item.songId}
                      onChange={(e) => handleSwapSong(item.id, e.target.value)}
                      aria-label={`Trocar música de ${MASS_MOMENT_LABELS[item.moment]}`}
                    >
                      {momentOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.title} ({opt.rating}★ • {opt.preferredKey || opt.originalKey})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => setPresentationIndex(idx)}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="alert alert-info">
          Nenhum setlist gerado ainda. Escolha uma liturgia acima e clique em &quot;Gerar Setlist Sugerido&quot;.
        </div>
      )}
    </div>
  );
}
