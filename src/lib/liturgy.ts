import {
  LiturgicalSeason,
  MASS_ORDER,
  MassMoment,
  MassSetlist,
  SetlistItem,
  Song,
} from '@/types/music';

export interface LiturgicalPreset {
  id: string;
  slug: string;
  title: string;
  liturgicalDay: string;
  season: LiturgicalSeason;
  omitGloria?: boolean;
  notes?: string;
}

export const LITURGICAL_PRESETS: LiturgicalPreset[] = [
  {
    id: '3-dom-comum',
    slug: 'missa_terceiro_domingo_tempo_comum',
    title: '3º Domingo do Tempo Comum',
    liturgicalDay: '3º Domingo do Tempo Comum — Ano C',
    season: 'tempo_comum',
    omitGloria: false,
  },
  {
    id: '1-dom-advento',
    slug: 'missa_primeiro_domingo_advento',
    title: '1º Domingo do Advento',
    liturgicalDay: '1º Domingo do Advento',
    season: 'advento',
    omitGloria: true,
    notes: 'Tempo de expectativa e vigilância. Não se canta o Glória.',
  },
  {
    id: 'natal',
    slug: 'missa_natal_do_senhor',
    title: 'Solenidade do Natal',
    liturgicalDay: 'Natal do Senhor — Missa do Dia',
    season: 'natal',
    omitGloria: false,
  },
  {
    id: 'quaresma',
    slug: 'missa_quaresma_domingo',
    title: 'Domingo da Quaresma',
    liturgicalDay: 'Tempo da Quaresma',
    season: 'quaresma',
    omitGloria: true,
    notes: 'Não se canta Glória nem Aleluia na Aclamação.',
  },
  {
    id: 'pascoa',
    slug: 'missa_domingo_de_pascoa',
    title: 'Domingo de Páscoa',
    liturgicalDay: 'Ressurreição do Senhor',
    season: 'pascoa',
    omitGloria: false,
  },
  {
    id: 'mariana',
    slug: 'missa_nossa_senhora',
    title: 'Festa Mariana',
    liturgicalDay: 'Memória / Solenidade de Nossa Senhora',
    season: 'mariano',
    omitGloria: false,
  },
];

export function slugifySetlistName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function getMomentsForSeason(season: LiturgicalSeason): MassMoment[] {
  if (season === 'quaresma' || season === 'advento') {
    return MASS_ORDER.filter((m) => m !== 'gloria');
  }
  return MASS_ORDER;
}

export function suggestSongForMoment(
  songs: Song[],
  moment: MassMoment,
  season: LiturgicalSeason,
  usedSongIds: Set<string>
): Song | null {
  const candidates = songs.filter((song) => song.moments.includes(moment));
  if (candidates.length === 0) return null;

  const scored = candidates.map((song) => {
    let score = song.rating * 10; // 10 to 50 points from star rating
    if (song.seasons.includes(season)) {
      score += 25; // exact liturgical season match
    } else if (song.seasons.includes('todos')) {
      score += 10; // universal song
    } else {
      score -= 15; // different season
    }
    if (usedSongIds.has(song.id)) {
      score -= 100; // strongly avoid repeating the same song in the same Mass
    }
    return { song, score };
  });

  scored.sort((a, b) => b.score - a.score || b.song.rating - a.song.rating);
  return scored[0]?.song ?? null;
}

export function generateMassSetlist(
  songs: Song[],
  params: {
    title: string;
    slug?: string;
    date: string;
    liturgicalDay: string;
    season: LiturgicalSeason;
  }
): MassSetlist {
  const moments = getMomentsForSeason(params.season);
  const usedIds = new Set<string>();
  const items: SetlistItem[] = [];

  for (const moment of moments) {
    const suggested = suggestSongForMoment(songs, moment, params.season, usedIds);
    if (suggested) {
      usedIds.add(suggested.id);
      items.push({
        id: `${moment}-${suggested.id}-${Math.random().toString(36).slice(2, 6)}`,
        moment,
        songId: suggested.id,
        customKey: suggested.preferredKey || suggested.originalKey,
      });
    }
  }

  const now = new Date().toISOString();
  return {
    id: `set-${Date.now()}`,
    slug: params.slug || slugifySetlistName(`missa_${params.title}`),
    title: params.title,
    date: params.date,
    liturgicalDay: params.liturgicalDay,
    season: params.season,
    items,
    createdAt: now,
    updatedAt: now,
  };
}
