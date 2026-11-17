import { MassSetlist, Song, UserProfile } from '@/types/music';

const SONGS_KEY = 'missachord_songs_v1';
const SETLISTS_KEY = 'missachord_setlists_v1';
const USER_KEY = 'missachord_user_v1';

export const SEED_SONGS: Song[] = [
  {
    id: 'song-1',
    title: 'Eis-me Aqui, Senhor',
    artist: 'Ministério Católico',
    originalKey: 'G',
    preferredKey: 'G',
    moments: ['entrada', 'final'],
    seasons: ['tempo_comum', 'todos'],
    rating: 5,
    chordPro: `{title: Eis-me Aqui, Senhor}
{artist: Ministério Católico}
{key: G}

{comment: Refrão}
[G]Eis-me a[D/F#]qui, Se[Em]nhor!
[C]Pra fa[G/B]zer tua von[Am]tade, pra vi[D]ver do teu amor
[G]Eis-me a[D/F#]qui, Se[Em]nhor!
[C]Pra fa[D]zer tua von[G]tade!

{comment: Estrofe 1}
[G]O Senhor é o pas[D/F#]tor que me con[Em]duz
[C]Por ca[Am]minhos de [D]paz e de [G]luz
[C]Sua pa[D]lavra me [G]faz ca[Em]minhar
[Am]E na sua [D]casa eu [G]vou habitar.`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-2',
    title: 'Senhor, Tende Piedade de Nós',
    artist: 'Liturgia Tradicional',
    originalKey: 'Em',
    preferredKey: 'Em',
    moments: ['ato_penitencial'],
    seasons: ['tempo_comum', 'quaresma', 'advento', 'todos'],
    rating: 5,
    chordPro: `{title: Senhor, Tende Piedade de Nós}
{artist: Liturgia Tradicional}
{key: Em}

[Em]Senhor, que [D]viestes sal[C]var os cora[B7]ções arrepen[Em]didos
[Am]Tende pie[Em]dade de [B7]nós, pie[Em]dade de nós!

[Em]Ó Cristo, que [D]viestes cha[C]mar os peca[B7]dores humi[Em]lhados
[Am]Tende pie[Em]dade de [B7]nós, pie[Em]dade de nós!

[Em]Senhor, que inter[D]cedeis por [C]nós junto a [B7]Deus Pai que nos per[Em]doa
[Am]Tende pie[Em]dade de [B7]nós, pie[Em]dade de nós!`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-3',
    title: 'Glória a Deus nas Alturas',
    artist: 'Comunidade Católica',
    originalKey: 'D',
    preferredKey: 'D',
    moments: ['gloria'],
    seasons: ['tempo_comum', 'natal', 'pascoa'],
    rating: 5,
    chordPro: `{title: Glória a Deus nas Alturas}
{artist: Comunidade Católica}
{key: D}

{comment: Refrão}
[D]Glória a Deus nas al[A]turas
[Bm]E paz na terra aos [G]homens por Ele a[A]mados!
[D]Glória a Deus nas al[A]turas
[Bm]E paz na [G]terra aos [A]homens por Ele a[D]mados!

{comment: Estrofe}
[G]Senhor Deus, [A]Rei dos céus, [F#m]Deus Pai todo-[Bm]poderoso
[G]Nós Vos lou[A]vamos, nós Vos bendi[D]zemos
[G]Nós Vos ado[A]ramos, nós Vos glorifi[Bm]camos
[Em]Nós Vos damos [A]graças por Vossa i[D]mensa glória.`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-4',
    title: 'Salmo 18 - Vossas Palavras, Senhor',
    artist: 'Salmodia Litúrgica',
    originalKey: 'C',
    preferredKey: 'C',
    moments: ['salmo'],
    seasons: ['tempo_comum', 'todos'],
    rating: 4,
    chordPro: `{title: Salmo 18 - Vossas Palavras, Senhor}
{artist: Salmodia Litúrgica}
{key: C}

{comment: Refrão}
[C]Vossas pa[G]lavras, Se[Am]nhor
[F]São es[G]pírito e [C]vida!

{comment: Estrofe 1}
[Am]A lei do Se[Em]nhor é per[F]feita e con[C]forta a alma
[Dm]O testemu[G]nho do Senhor é fi[C]el e dá sabedo[E7]ria aos humildes.`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-5',
    title: 'Aleluia, Como o Pai Me Amou',
    artist: 'Canto de Aclamação',
    originalKey: 'E',
    preferredKey: 'E',
    moments: ['aclamacao'],
    seasons: ['tempo_comum', 'pascoa', 'natal'],
    rating: 5,
    chordPro: `{title: Aleluia, Como o Pai Me Amou}
{artist: Canto de Aclamação}
{key: E}

[E]Ale[B]luia, ale[C#m]luia!
[A]Ale[B]luia, ale[E]luia!

[E]Como o [B]Pai me a[C#m]mou, assim também eu vos a[G#m]mei
[A]Permane[E]cei no meu a[B]mor, diz o Se[E]nhor!`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-6',
    title: 'Sabes, Senhor, o Que Tenho',
    artist: 'Canto das Oferendas',
    originalKey: 'G',
    preferredKey: 'G',
    moments: ['ofertorio'],
    seasons: ['tempo_comum', 'quaresma', 'todos'],
    rating: 5,
    chordPro: `{title: Sabes, Senhor, o Que Tenho}
{artist: Canto das Oferendas}
{key: G}

{comment: Estrofe}
[G]Sabes, Se[D/F#]nhor, o que [Em]tenho é tão pouco pra [Bm]dar
[C]Mas este [G/B]pouco, nós que[Am]remos com os irmãos parti[D]lhar.

{comment: Refrão}
[G]Queremos a[D]presentar a Ti, Se[Em]nhor
[C]O pão e o [G/B]vinho, frutos do [Am]nosso a[D]mor
[G]Transforma-[D]os em Ti, ó Bom Pas[Em]tor
[C]Pra que se[D]jamos sinais do teu [G]reino.`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-7',
    title: 'Santo, Santo, Santo é o Senhor',
    artist: 'Liturgia Eucarística',
    originalKey: 'A',
    preferredKey: 'A',
    moments: ['santo'],
    seasons: ['tempo_comum', 'todos'],
    rating: 5,
    chordPro: `{title: Santo, Santo, Santo é o Senhor}
{artist: Liturgia Eucarística}
{key: A}

[A]Santo, [E]Santo, [F#m]Santo é o Se[D]nhor, Deus do uni[E]verso!
[A]O céu e a [E]terra pro[F#m]clamam a [D]Vossa [E]glória!
[D]Ho[E]sana nas al[A]tu[F#m]ras, ho[D]sana nas al[E]turas!
[A]Bendito o que [E]vem em [F#m]nome do Se[D]nhor
[D]Ho[E]sana nas al[A]turas!`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-8',
    title: 'Cordeiro de Deus',
    artist: 'Liturgia Eucarística',
    originalKey: 'C',
    preferredKey: 'C',
    moments: ['cordeiro'],
    seasons: ['tempo_comum', 'todos'],
    rating: 4,
    chordPro: `{title: Cordeiro de Deus}
{artist: Liturgia Eucarística}
{key: C}

[C]Cordeiro de [G/B]Deus, que ti[Am]rais o pe[Em]cado do [F]mundo
[Dm]Tende pie[G]dade de [C]nós!
[C]Cordeiro de [G/B]Deus, que ti[Am]rais o pe[Em]cado do [F]mundo
[Dm]Tende pie[G]dade de [C]nós!
[C]Cordeiro de [G/B]Deus, que ti[Am]rais o pe[Em]cado do [F]mundo
[Dm]Dai-nos a [G]Vossa [C]paz!`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-9',
    title: 'Pão da Vida, Comunhão e Paz',
    artist: 'Comunidade Eucarística',
    originalKey: 'D',
    preferredKey: 'D',
    moments: ['comunhao', 'acao_gracas', 'adoracao'],
    seasons: ['tempo_comum', 'todos'],
    rating: 5,
    chordPro: `{title: Pão da Vida, Comunhão e Paz}
{artist: Comunidade Eucarística}
{key: D}

{comment: Refrão}
[D]Ó Senhor, eu não sou [A/C#]digno
Que en[Bm]treis em minha mo[F#m]rada
[G]Mas di[A]zei uma só pa[D]lavra [Bm]
E a [Em]minha alma se[A]rá cu[D]rada.

{comment: Estrofe 1}
[G]Neste pão que é teu [A]Corpo entre[D]gue por [Bm]nós
[Em]Encontramos a [A]força pra se[D]guir tua [D7]voz.`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-10',
    title: 'Ide por Todo o Mundo',
    artist: 'Canto de Envio',
    originalKey: 'G',
    preferredKey: 'G',
    moments: ['final', 'entrada'],
    seasons: ['tempo_comum', 'pascoa', 'todos'],
    rating: 5,
    chordPro: `{title: Ide por Todo o Mundo}
{artist: Canto de Envio}
{key: G}

[G]Ide por todo o [D]mundo e anun[Em]ciai o Evan[Bm]gelho
[C]Levai a [G/B]paz, levai a [Am]luz, o amor de [D]Cristo!
[G]Com Maria cami[D]nhando, na for[Em]ça do Es[Bm]pírito
[C]Seremos [D]sal e luz no [G]mundo!`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'song-11',
    title: 'Louvor e Honra a Vós, Senhor',
    artist: 'Aclamação Quaresmal',
    originalKey: 'Dm',
    preferredKey: 'Dm',
    moments: ['aclamacao'],
    seasons: ['quaresma'],
    rating: 5,
    chordPro: `{title: Louvor e Honra a Vós, Senhor}
{artist: Aclamação Quaresmal}
{key: Dm}

[Dm]Louvor e [C]honra a Vós, Se[Bb]nhor Je[A7]sus!
[Dm]Louvor e [C]honra a Vós, Se[A7]nhor Je[Dm]sus!`,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
];

export function loadSongs(): Song[] {
  if (typeof window === 'undefined') return SEED_SONGS;
  const raw = window.localStorage.getItem(SONGS_KEY);
  if (!raw) {
    window.localStorage.setItem(SONGS_KEY, JSON.stringify(SEED_SONGS));
    return SEED_SONGS;
  }
  try {
    return JSON.parse(raw) as Song[];
  } catch {
    return SEED_SONGS;
  }
}

export function saveSongs(songs: Song[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
}

export function loadSetlists(): MassSetlist[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(SETLISTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MassSetlist[];
  } catch {
    return [];
  }
}

export function saveSetlists(setlists: MassSetlist[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SETLISTS_KEY, JSON.stringify(setlists));
}

export function loadUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    window.localStorage.removeItem(USER_KEY);
  } else {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}
