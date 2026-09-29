import { Track } from '../../types/audio';
import { UserPreferences } from '../../types/user';

export interface IDatabaseAdapter {
  getAllTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | null>;
  createTrack(trackData: Omit<Track, 'id' | 'createdAt'>): Promise<Track>;
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void>;
  toggleFavorite(userId: string, trackId: string): Promise<boolean>;
}
