import { UserProfile } from '@/types/music';

export const FREE_LIMITS = {
  maxSongs: 50,
  maxSetlists: 3,
  maxUrlImportsPerMonth: 5,
};

export function canAddSong(user: UserProfile | null, currentSongCount: number): boolean {
  if (user?.plan === 'premium') return true;
  return currentSongCount < FREE_LIMITS.maxSongs;
}

export function canAddSetlist(user: UserProfile | null, currentSetlistCount: number): boolean {
  if (user?.plan === 'premium') return true;
  return currentSetlistCount < FREE_LIMITS.maxSetlists;
}
