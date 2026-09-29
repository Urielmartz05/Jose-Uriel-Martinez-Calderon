export type RepeatMode = 'off' | 'all' | 'one';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;        // En segundos
  audioUrl: string;
  coverUrl: string;
  genre?: string;
  releaseYear?: number;
  createdAt: string;
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;     // Segundos
  duration: number;        // Segundos
  volume: number;          // 0.0 a 1.0
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  originalQueue: Track[];
  currentIndex: number;
}
