import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MassSetlist, Song, UserProfile } from '@/types/music';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return client;
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  const sb = getSupabaseClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  return { error: error?.message };
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user?: UserProfile; error?: string }> {
  const sb = getSupabaseClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { error: error?.message || 'Falha ao entrar.' };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email || email,
      name:
        (data.user.user_metadata?.name as string) ||
        email.split('@')[0],
      provider: 'email',
      plan: 'free',
    },
  };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<{ user?: UserProfile; error?: string }> {
  const sb = getSupabaseClient();
  if (!sb) return { error: 'Supabase não configurado.' };

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error || !data.user) {
    return { error: error?.message || 'Falha ao cadastrar.' };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email || email,
      name: name || email.split('@')[0],
      provider: 'email',
      plan: 'free',
    },
  };
}

export async function signOutSupabase(): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    await sb.auth.signOut();
  }
}

export async function fetchRemoteSongs(userId: string): Promise<Song[] | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('rating', { ascending: false });

  if (error || !data) return null;

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    artist: row.artist || undefined,
    originalKey: row.original_key,
    preferredKey: row.preferred_key || undefined,
    capo: row.capo || 0,
    chordPro: row.chord_pro,
    moments: row.moments || [],
    seasons: row.seasons || ['todos'],
    rating: row.rating ?? 5,
    sourceUrl: row.source_url || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function upsertRemoteSong(userId: string, song: Song): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  await sb.from('songs').upsert({
    id: song.id,
    user_id: userId,
    title: song.title,
    artist: song.artist ?? null,
    original_key: song.originalKey,
    preferred_key: song.preferredKey ?? null,
    capo: song.capo ?? 0,
    chord_pro: song.chordPro,
    moments: song.moments,
    seasons: song.seasons,
    rating: song.rating,
    source_url: song.sourceUrl ?? null,
    notes: song.notes ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteRemoteSong(userId: string, songId: string): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from('songs').delete().eq('id', songId).eq('user_id', userId);
}

export async function fetchRemoteSetlists(userId: string): Promise<MassSetlist[] | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('setlists')
    .select('*')
    .eq('user_id', userId)
    .order('celebration_date', { ascending: false });

  if (error || !data) return null;

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.celebration_date,
    liturgicalDay: row.liturgical_day,
    season: row.season,
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function upsertRemoteSetlist(
  userId: string,
  setlist: MassSetlist
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;

  await sb.from('setlists').upsert({
    id: setlist.id,
    user_id: userId,
    slug: setlist.slug,
    title: setlist.title,
    celebration_date: setlist.date,
    liturgical_day: setlist.liturgicalDay,
    season: setlist.season,
    items: setlist.items,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteRemoteSetlist(
  userId: string,
  setlistId: string
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb) return;
  await sb.from('setlists').delete().eq('id', setlistId).eq('user_id', userId);
}
