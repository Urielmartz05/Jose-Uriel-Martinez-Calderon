import { Track } from '../types/audio';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight City Lights',
    artist: 'Aura Nova',
    album: 'Neon Horizon',
    duration: 372,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    genre: 'Synthwave',
    releaseYear: 2025,
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'track-2',
    title: 'Solar Echoes',
    artist: 'Kaelen Vance',
    album: 'Astral Drift',
    duration: 423,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    genre: 'Ambient',
    releaseYear: 2025,
    createdAt: '2026-01-20T10:30:00.000Z'
  },
  {
    id: 'track-3',
    title: 'Velvet Groove',
    artist: 'Luna Solaris',
    album: 'Late Night Sessions',
    duration: 345,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    genre: 'Nu-Disco',
    releaseYear: 2026,
    createdAt: '2026-02-01T14:15:00.000Z'
  },
  {
    id: 'track-4',
    title: 'Cybernetic Pulse',
    artist: 'Vector Prime',
    album: 'Sublevel 0',
    duration: 302,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    genre: 'Cyberpunk / Electro',
    releaseYear: 2024,
    createdAt: '2026-02-10T12:00:00.000Z'
  },
  {
    id: 'track-5',
    title: 'Golden Hour Mirage',
    artist: 'Elena Cruz',
    album: 'Coastal Reverie',
    duration: 354,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    genre: 'Indie Pop',
    releaseYear: 2026,
    createdAt: '2026-02-18T16:45:00.000Z'
  },
  {
    id: 'track-6',
    title: 'Deep Horizon',
    artist: 'Marcus Thorne',
    album: 'Pacific Memories',
    duration: 380,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    genre: 'Deep House',
    releaseYear: 2025,
    createdAt: '2026-02-25T19:00:00.000Z'
  }
];

export const DEFAULT_PLAYER_CONFIG = {
  initialVolume: 0.8,
  defaultRepeatMode: 'off' as const,
  defaultShuffle: false
};
