import { Song, User, UserSettings, initDB } from './index';

export const initialTracks = [
  {
    title: 'Neon Lights',
    artist: 'Luna Pulse',
    album: 'Cyber Dreams',
    duration: 195,
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    genre: 'Electronic',
  },
  {
    title: 'Solar Eclipse',
    artist: 'Horizon Wave',
    album: 'Dawn of Tomorrow',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    genre: 'Synthpop',
  },
  {
    title: 'Velvet Sky',
    artist: 'Aura Collective',
    album: 'Serenade',
    duration: 184,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    genre: 'Lo-Fi',
  },
  {
    title: 'Cosmic Journey',
    artist: 'Starlight Odyssey',
    album: 'Infinity',
    duration: 232,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    genre: 'Ambient',
  },
  {
    title: 'Urban Rhythm',
    artist: 'Metro Groove',
    album: 'City Echoes',
    duration: 178,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    genre: 'Nu-Disco',
  },
  {
    title: 'Deep Ocean',
    artist: 'Aquatic Drift',
    album: 'Abyss Sounds',
    duration: 205,
    coverUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    genre: 'Chillout',
  },
];

export async function seedDatabase(): Promise<void> {
  await initDB();

  const count = await Song.count();
  if (count === 0) {
    await Song.bulkCreate(initialTracks);
    console.log('[Seeder] 6 canciones iniciales insertadas con éxito.');
  }

  // Verificar o insertar usuario demo por omisión
  const defaultEmail = 'alex.rivera@example.com';
  const existingUser = await User.findOne({ where: { email: defaultEmail } });
  if (!existingUser) {
    const demoUser = await User.create({
      username: 'AlexRivera',
      email: defaultEmail,
      password: 'Password123!',
    });

    await UserSettings.create({
      userId: demoUser.id,
      defaultVolume: 0.8,
      autoPlayNext: true,
      theme: 'dark',
      preferredEqualizer: 'flat',
    });
    console.log('[Seeder] Usuario demo de pruebas aprovisionado.');
  }
}

if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('[Seeder] Proceso de semillado finalizado.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seeder] Error ejecutando el semillado:', err);
      process.exit(1);
    });
}
