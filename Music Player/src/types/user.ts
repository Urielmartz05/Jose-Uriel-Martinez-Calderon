export interface UserPreferences {
  favoriteTrackIds: string[];
  volume: number;
  lastTrackId: string | null;
  lastPositionSeconds: number;
  theme: 'dark' | 'light' | 'system';
}

export interface UserSession {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  preferences: UserPreferences;
}
