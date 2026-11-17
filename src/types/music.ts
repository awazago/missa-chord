export type MassMoment =
  | 'entrada'
  | 'ato_penitencial'
  | 'gloria'
  | 'salmo'
  | 'aclamacao'
  | 'ofertorio'
  | 'santo'
  | 'cordeiro'
  | 'comunhao'
  | 'acao_gracas'
  | 'final'
  | 'adoracao';

export type LiturgicalSeason =
  | 'todos'
  | 'tempo_comum'
  | 'advento'
  | 'natal'
  | 'quaresma'
  | 'pascoa'
  | 'mariano';

export interface Song {
  id: string;
  title: string;
  artist?: string;
  originalKey: string;
  preferredKey?: string;
  capo?: number;
  chordPro: string;
  moments: MassMoment[];
  seasons: LiturgicalSeason[];
  rating: number; // 1 to 5
  sourceUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetlistItem {
  id: string;
  moment: MassMoment;
  songId: string;
  customKey?: string;
  notes?: string;
}

export interface MassSetlist {
  id: string;
  slug: string; // e.g., missa_terceiro_domingo_tempo_comum
  title: string;
  date: string;
  liturgicalDay: string;
  season: LiturgicalSeason;
  items: SetlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider: 'email' | 'google';
  plan: 'free' | 'premium';
}

export const MASS_MOMENT_LABELS: Record<MassMoment, string> = {
  entrada: 'Entrada',
  ato_penitencial: 'Ato Penitencial',
  gloria: 'Glória',
  salmo: 'Salmo Responsorial',
  aclamacao: 'Aclamação ao Evangelho',
  ofertorio: 'Ofertório',
  santo: 'Santo',
  cordeiro: 'Cordeiro',
  comunhao: 'Comunhão',
  acao_gracas: 'Ação de Graças',
  final: 'Final',
  adoracao: 'Adoração / Outros',
};

export const LITURGICAL_SEASON_LABELS: Record<LiturgicalSeason, string> = {
  todos: 'Todos os Tempos',
  tempo_comum: 'Tempo Comum',
  advento: 'Advento',
  natal: 'Natal',
  quaresma: 'Quaresma',
  pascoa: 'Páscoa',
  mariano: 'Festas Marianas',
};

export const MASS_ORDER: MassMoment[] = [
  'entrada',
  'ato_penitencial',
  'gloria',
  'salmo',
  'aclamacao',
  'ofertorio',
  'santo',
  'cordeiro',
  'comunhao',
  'acao_gracas',
  'final',
];
