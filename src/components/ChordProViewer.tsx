'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Minus,
  Plus,
  Moon,
  Sun,
  Smartphone,
  Edit3,
  Save,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  detectKeyFromChordPro,
  parseChordPro,
  transposeChord,
  transposeChordPro,
} from '@/lib/chordpro';
import {
  LITURGICAL_SEASON_LABELS,
  MASS_MOMENT_LABELS,
  Song,
} from '@/types/music';
import { StarRating } from './StarRating';

interface ChordProViewerProps {
  song: Song;
  onUpdateSong?: (updated: Song) => void;
  onDeleteSong?: (songId: string) => void;
  compactHeader?: boolean;
}

export function ChordProViewer({
  song,
  onUpdateSong,
  onDeleteSong,
  compactHeader = false,
}: ChordProViewerProps) {
  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [stageDark, setStageDark] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftChordPro, setDraftChordPro] = useState(song.chordPro);

  useEffect(() => {
    setSemitones(0);
    setDraftChordPro(song.chordPro);
    setIsEditing(false);
  }, [song.id, song.chordPro]);

  // Screen Wake Lock API for keeping tablet/phone screen awake during Mass
  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    if (wakeLockActive && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          sentinel = s;
        })
        .catch(() => {
          setWakeLockActive(false);
        });
    }
    return () => {
      sentinel?.release().catch(() => {});
    };
  }, [wakeLockActive]);

  const transposedText = useMemo(
    () => transposeChordPro(song.chordPro, semitones),
    [song.chordPro, semitones]
  );

  const parsed = useMemo(() => parseChordPro(transposedText), [transposedText]);
  const baseKey = song.preferredKey || song.originalKey || detectKeyFromChordPro(song.chordPro);
  const currentKey = transposeChord(baseKey, semitones);

  const handleSavePreferredKey = () => {
    if (!onUpdateSong) return;
    onUpdateSong({
      ...song,
      chordPro: transposedText,
      preferredKey: currentKey,
      updatedAt: new Date().toISOString(),
    });
    setSemitones(0);
  };

  const handleSaveEdit = () => {
    if (!onUpdateSong) return;
    const newKey = detectKeyFromChordPro(draftChordPro);
    onUpdateSong({
      ...song,
      chordPro: draftChordPro,
      originalKey: newKey,
      preferredKey: newKey,
      updatedAt: new Date().toISOString(),
    });
    setSemitones(0);
    setIsEditing(false);
  };

  return (
    <div>
      {!compactHeader && (
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 className="page-title" style={{ fontSize: '1.45rem' }}>
                {song.title}
              </h2>
              {song.artist && (
                <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem' }}>
                  {song.artist}
                </p>
              )}
            </div>
            <StarRating
              value={song.rating}
              size={20}
              onChange={(rating) =>
                onUpdateSong?.({
                  ...song,
                  rating,
                  updatedAt: new Date().toISOString(),
                })
              }
            />
          </div>

          <div className="tag-row" style={{ marginTop: '0.6rem' }}>
            {song.moments.map((m) => (
              <span key={m} className="tag tag-gold">
                {MASS_MOMENT_LABELS[m]}
              </span>
            ))}
            {song.seasons.map((s) => (
              <span key={s} className="tag">
                {LITURGICAL_SEASON_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stage / Transposition Toolbar */}
      <div className="stage-toolbar">
        <div className="toolbar-group">
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Tom:
          </span>
          <button
            type="button"
            className="btn btn-sm btn-icon"
            onClick={() => setSemitones((s) => s - 1)}
            title="Descer meio tom (-1)"
          >
            <Minus size={15} />
          </button>
          <span className="key-badge" style={{ minWidth: '42px' }}>
            {currentKey}
          </span>
          <button
            type="button"
            className="btn btn-sm btn-icon"
            onClick={() => setSemitones((s) => s + 1)}
            title="Subir meio tom (+1)"
          >
            <Plus size={15} />
          </button>
          {semitones !== 0 && (
            <>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setSemitones(0)}
                title="Voltar ao tom salvo"
              >
                <RotateCcw size={14} /> Original
              </button>
              {onUpdateSong && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={handleSavePreferredKey}
                >
                  <Save size={14} /> Salvar em {currentKey}
                </button>
              )}
            </>
          )}
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setFontSize((f) => Math.max(12, f - 2))}
            title="Diminuir fonte"
          >
            A-
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setFontSize((f) => Math.min(26, f + 2))}
            title="Aumentar fonte"
          >
            A+
          </button>
          <button
            type="button"
            className={`btn btn-sm ${stageDark ? 'btn-primary' : ''}`}
            onClick={() => setStageDark((d) => !d)}
            title="Modo Palco Escuro (ideal para igrejas com pouca luz)"
          >
            {stageDark ? <Sun size={14} /> : <Moon size={14} />}
            {stageDark ? 'Claro' : 'Palco'}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${wakeLockActive ? 'btn-gold' : ''}`}
            onClick={() => setWakeLockActive((w) => !w)}
            title="Manter tela sempre acesa durante a missa"
          >
            <Smartphone size={14} />
            {wakeLockActive ? 'Tela Acesa' : 'Manter Tela'}
          </button>
          {onUpdateSong && (
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setIsEditing((e) => !e)}
            >
              <Edit3 size={14} /> {isEditing ? 'Cancelar' : 'Editar ChordPro'}
            </button>
          )}
          {onDeleteSong && (
            <button
              type="button"
              className="btn btn-sm"
              style={{ color: 'var(--danger)' }}
              onClick={() => onDeleteSong(song.id)}
              title="Excluir música"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="card" style={{ padding: '1rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            Editor ChordPro
          </label>
          <textarea
            className="textarea textarea-mono"
            rows={14}
            value={draftChordPro}
            onChange={(e) => setDraftChordPro(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>
              <Save size={15} /> Salvar Alterações
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`chordpro-sheet ${stageDark ? 'stage-dark' : ''}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {parsed.meta.capo ? (
            <div className="chordpro-comment" style={{ marginTop: 0 }}>
              Capotraste: {parsed.meta.capo}ª casa
            </div>
          ) : null}

          {parsed.lines.map((line, idx) => {
            if (line.type === 'empty') {
              return <div key={idx} className="chordpro-empty" />;
            }
            if (line.type === 'comment' || line.type === 'section') {
              return (
                <div key={idx} className="chordpro-comment">
                  {line.text}
                </div>
              );
            }
            return (
              <div key={idx} className="chordpro-line">
                {line.segments?.map((seg, sIdx) => (
                  <span key={sIdx} className="chord-segment">
                    <span className="chord-symbol">{seg.chord || '\u00A0'}</span>
                    <span className="lyric-text">{seg.text || '\u00A0'}</span>
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
