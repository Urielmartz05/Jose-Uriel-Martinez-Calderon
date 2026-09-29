import { Track } from '../../types/audio';
import { UserPreferences } from '../../types/user';
import { IDatabaseAdapter } from './adapter';
import { INITIAL_TRACKS, DEFAULT_PLAYER_CONFIG } from '../audio-constants';

export class MockDatabaseAdapter implements IDatabaseAdapter {
  private tracks: Track[] = [...INITIAL_TRACKS];
  private preferences: Map<string, UserPreferences> = new Map();

  constructor() {
    this.preferences.set('default-user', {
      favoriteTrackIds: ['track-1', 'track-3'],
      volume: DEFAULT_PLAYER_CONFIG.initialVolume,
      lastTrackId: 'track-1',
      lastPositionSeconds: 0,
      theme: 'dark'
    });
  }

  async getAllTracks(): Promise<Track[]> {
    return [...this.tracks];
  }

  async getTrackById(id: string): Promise<Track | null> {
    const track = this.tracks.find((t) => t.id === id);
    return track ? { ...track } : null;
  }

  async createTrack(trackData: Omit<Track, 'id' | 'createdAt'>): Promise<Track> {
    const newTrack: Track = {
      ...trackData,
      id: `track-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.tracks.push(newTrack);
    return { ...newTrack };
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const existing = this.preferences.get(userId);
    if (existing) {
      return { ...existing, favoriteTrackIds: [...existing.favoriteTrackIds] };
    }
    const defaultPrefs: UserPreferences = {
      favoriteTrackIds: [],
      volume: DEFAULT_PLAYER_CONFIG.initialVolume,
      lastTrackId: null,
      lastPositionSeconds: 0,
      theme: 'dark'
    };
    this.preferences.set(userId, defaultPrefs);
    return { ...defaultPrefs };
  }

  async updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
    const current = await this.getUserPreferences(userId);
    this.preferences.set(userId, {
      ...current,
      ...prefs
    });
  }

  async toggleFavorite(userId: string, trackId: string): Promise<boolean> {
    const prefs = await this.getUserPreferences(userId);
    const index = prefs.favoriteTrackIds.indexOf(trackId);
    let isFavorite: boolean;

    if (index >= 0) {
      prefs.favoriteTrackIds.splice(index, 1);
      isFavorite = false;
    } else {
      prefs.favoriteTrackIds.push(trackId);
      isFavorite = true;
    }

    await this.updateUserPreferences(userId, prefs);
    return isFavorite;
  }
}

export const dbAdapter = new MockDatabaseAdapter();
