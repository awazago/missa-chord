'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Music,
  PlusCircle,
  CalendarDays,
  User,
  Search,
  X,
  ListMusic,
  ArrowUpDown,
} from 'lucide-react';
import {
  loadSetlists,
  loadSongs,
  loadUser,
  saveSetlists,
  saveSongs,
  saveUser,
} from '@/lib/storage';
import {
  MASS_MOMENT_LABELS,
  MassMoment,
  MassSetlist,
  Song,
  UserProfile,
} from '@/types/music';
import { canAddSetlist, canAddSong, FREE_LIMITS } from '@/lib/plans';
import { getSupabaseClient } from '@/lib/supabase';
import { AuthGate } from '@/components/AuthGate';
import { StarRating } from '@/components/StarRating';
import { ChordProViewer } from '@/components/ChordProViewer';
import { ImportSongView } from '@/components/ImportSongView';
import { SetlistView } from '@/components/SetlistView';
import { AccountView } from '@/components/AccountView';

type Tab = 'acervo' | 'importar' | 'setlists' | 'conta';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('acervo');
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlists, setSetlists] = useState<MassSetlist[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Acervo filters
  const [searchQuery, setSearchQuery] = useState('');
  const [momentFilter, setMomentFilter] = useState<MassMoment | 'all'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'title'>('rating');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  useEffect(() => {
    setSongs(loadSongs());
    setSetlists(loadSetlists());
    setUser(loadUser());
    setHydrated(true);

    const sb = getSupabaseClient();
    if (sb) {
      sb.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const u = data.session.user;
          const profile: UserProfile = {
            id: u.id,
            email: u.email || '',
            name: (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Músico',
            provider: u.app_metadata?.provider === 'google' ? 'google' : 'email',
            plan: 'free',
          };
          setUser(profile);
          saveUser(profile);
        }
      });
    }
  }, []);

  const updateAndPersistSongs = (nextSongs: Song[]) => {
    setSongs(nextSongs);
    saveSongs(nextSongs);
  };

  const handleUpdateSong = (updated: Song) => {
    updateAndPersistSongs(songs.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSong = (songId: string) => {
    updateAndPersistSongs(songs.filter((s) => s.id !== songId));
    if (selectedSongId === songId) setSelectedSongId(null);
  };

  const handleSaveNewSong = (newSong: Song) => {
    if (!canAddSong(user, songs.length)) {
      setLimitNotice(
        `Você atingiu o limite de ${FREE_LIMITS.maxSongs} músicas do plano gratuito. Faça upgrade para o Premium em Conta & Planos.`
      );
      setActiveTab('conta');
      return;
    }
    setLimitNotice(null);
    updateAndPersistSongs([newSong, ...songs]);
    setActiveTab('acervo');
    setSelectedSongId(newSong.id);
  };

  const handleSaveSetlist = (setlist: MassSetlist) => {
    const exists = setlists.some((s) => s.id === setlist.id);
    if (!exists && !canAddSetlist(user, setlists.length)) {
      setLimitNotice(
        `Você atingiu o limite de ${FREE_LIMITS.maxSetlists} setlists do plano gratuito. Faça upgrade para o Premium em Conta & Planos.`
      );
      setActiveTab('conta');
      return;
    }
    setLimitNotice(null);
    const next = exists
      ? setlists.map((s) => (s.id === setlist.id ? setlist : s))
      : [setlist, ...setlists];
    setSetlists(next);
    saveSetlists(next);
  };

  const handleDeleteSetlist = (id: string) => {
    const next = setlists.filter((s) => s.id !== id);
    setSetlists(next);
    saveSetlists(next);
  };

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return songs
      .filter((song) => {
        if (momentFilter !== 'all' && !song.moments.includes(momentFilter)) {
          return false;
        }
        if (!q) return true;
        return (
          song.title.toLowerCase().includes(q) ||
          (song.artist?.toLowerCase().includes(q) ?? false) ||
          song.chordPro.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.rating - a.rating || a.title.localeCompare(b.title);
        }
        return a.title.localeCompare(b.title);
      });
  }, [songs, searchQuery, momentFilter, sortBy]);

  const selectedSong = songs.find((s) => s.id === selectedSongId) ?? null;

  if (!hydrated) {
    return (
      <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="alert alert-info">Carregando ChordSet...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        onLogin={(loggedUser) => {
          setUser(loggedUser);
          saveUser(loggedUser);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-inner">
          <a
            href="#acervo"
            className="brand"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('acervo');
            }}
          >
            <span className="brand-mark">
              <ListMusic size={18} />
            </span>
            <span>
              <span className="brand-name">ChordSet</span>
              <span className="brand-sub">Acervo &amp; Setlists em ChordPro</span>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="Navegação principal">
            <button
              type="button"
              className={`nav-btn ${activeTab === 'acervo' ? 'active' : ''}`}
              onClick={() => setActiveTab('acervo')}
            >
              <Music size={16} /> Acervo ({songs.length})
            </button>
            <button
              type="button"
              className={`nav-btn ${activeTab === 'importar' ? 'active' : ''}`}
              onClick={() => setActiveTab('importar')}
            >
              <PlusCircle size={16} /> Importar URL
            </button>
            <button
              type="button"
              className={`nav-btn ${activeTab === 'setlists' ? 'active' : ''}`}
              onClick={() => setActiveTab('setlists')}
            >
              <CalendarDays size={16} /> Setlists ({setlists.length})
            </button>
            <button
              type="button"
              className={`nav-btn ${activeTab === 'conta' ? 'active' : ''}`}
              onClick={() => setActiveTab('conta')}
            >
              <User size={16} /> {user ? user.name.split(' ')[0] : 'Entrar'}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {limitNotice && (
          <div className="alert alert-error" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
            <span>{limitNotice}</span>
            <button
              type="button"
              className="btn btn-sm btn-icon"
              onClick={() => setLimitNotice(null)}
              aria-label="Fechar aviso"
            >
              <X size={14} />
            </button>
          </div>
        )}
        {!hydrated ? (
          <div className="alert alert-info">Carregando acervo offline...</div>
        ) : activeTab === 'acervo' ? (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">Acervo de Músicas</h1>
                <p className="page-subtitle">
                  Cifras padronizadas em ChordPro com transposição instantânea e classificação por estrelas.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('importar')}
              >
                <PlusCircle size={16} /> Nova Música / URL
              </button>
            </div>

            <div className="filter-bar">
              <div className="search-row">
                <div className="search-input-wrap">
                  <Search size={16} className="search-icon" />
                  <input
                    type="search"
                    className="input"
                    placeholder="Buscar por título, artista ou trecho da letra..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSortBy((s) => (s === 'rating' ? 'title' : 'rating'))}
                  title="Alternar ordenação"
                >
                  <ArrowUpDown size={15} />
                  {sortBy === 'rating' ? 'Melhores (★)' : 'Nome (A-Z)'}
                </button>
              </div>

              <div className="chip-scroll" role="tablist" aria-label="Filtrar por momento da missa">
                <button
                  type="button"
                  className={`chip ${momentFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setMomentFilter('all')}
                >
                  Todos os Momentos
                </button>
                {(Object.keys(MASS_MOMENT_LABELS) as MassMoment[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`chip ${momentFilter === m ? 'active' : ''}`}
                    onClick={() => setMomentFilter(m)}
                  >
                    {MASS_MOMENT_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {filteredSongs.length === 0 ? (
              <div className="alert alert-info">
                Nenhuma música encontrada para esse filtro. Que tal importar uma nova cifra?
              </div>
            ) : (
              <div className="song-grid">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className="card song-card"
                    onClick={() => setSelectedSongId(song.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSongId(song.id);
                      }
                    }}
                  >
                    <div className="song-card-top">
                      <div>
                        <div className="song-title">{song.title}</div>
                        {song.artist && <div className="song-artist">{song.artist}</div>}
                      </div>
                      <span className="key-badge" title="Tom atual">
                        {song.preferredKey || song.originalKey}
                      </span>
                    </div>

                    <div className="tag-row">
                      {song.moments.map((m) => (
                        <span key={m} className="tag tag-gold">
                          {MASS_MOMENT_LABELS[m]}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                        paddingTop: '0.25rem',
                      }}
                    >
                      <StarRating
                        value={song.rating}
                        onChange={(rating) =>
                          handleUpdateSong({
                            ...song,
                            rating,
                            updatedAt: new Date().toISOString(),
                          })
                        }
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600 }}>
                        Abrir cifra →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : activeTab === 'importar' ? (
          <ImportSongView onSaveSong={handleSaveNewSong} />
        ) : activeTab === 'setlists' ? (
          <SetlistView
            songs={songs}
            setlists={setlists}
            onSaveSetlist={handleSaveSetlist}
            onDeleteSetlist={handleDeleteSetlist}
            onUpdateSong={handleUpdateSong}
          />
        ) : (
          <AccountView
            user={user}
            onLogin={(u) => {
              setUser(u);
              saveUser(u);
            }}
            onLogout={() => {
              setUser(null);
              saveUser(null);
            }}
            onUpgradePlan={() => {
              const next: UserProfile = user
                ? { ...user, plan: 'premium' }
                : {
                    id: `user-${Date.now()}`,
                    name: 'Músico Premium',
                    email: 'premium@paroquia.org',
                    provider: 'email',
                    plan: 'premium',
                  };
              setUser(next);
              saveUser(next);
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav" aria-label="Navegação mobile">
        <div className="mobile-nav-grid">
          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'acervo' ? 'active' : ''}`}
            onClick={() => setActiveTab('acervo')}
          >
            <Music size={19} />
            Acervo
          </button>
          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'importar' ? 'active' : ''}`}
            onClick={() => setActiveTab('importar')}
          >
            <PlusCircle size={19} />
            Importar
          </button>
          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'setlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('setlists')}
          >
            <CalendarDays size={19} />
            Setlists
          </button>
          <button
            type="button"
            className={`mobile-nav-btn ${activeTab === 'conta' ? 'active' : ''}`}
            onClick={() => setActiveTab('conta')}
          >
            <User size={19} />
            Conta
          </button>
        </div>
      </nav>

      {/* Song ChordPro Modal */}
      {selectedSong && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedSongId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                Visualizador ChordPro
              </span>
              <button
                type="button"
                className="btn btn-sm btn-icon"
                onClick={() => setSelectedSongId(null)}
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <ChordProViewer
                song={selectedSong}
                onUpdateSong={handleUpdateSong}
                onDeleteSong={handleDeleteSong}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
