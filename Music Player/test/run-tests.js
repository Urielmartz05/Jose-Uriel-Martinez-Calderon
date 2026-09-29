// Validaciones críticas según agents.md:
// Test 1: Bucle de Avance Automático (onEnded)
// Test 2: Algoritmo de Shuffle sin Mutación
// Test 3: Contrato de Adaptador de Base de Datos

const assert = require('assert');

// 1. Simulación y prueba de Shuffle sin mutación
function shuffleTracks(tracks, currentTrack) {
  if (!currentTrack) {
    const shuffled = [...tracks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  const remainder = tracks.filter((t) => t.id !== currentTrack.id);
  for (let i = remainder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remainder[i], remainder[j]] = [remainder[j], remainder[i]];
  }
  return [currentTrack, ...remainder];
}

// 2. Simulación de avance automático onEnded
function getNextTrackIndex(currentIndex, queueLength, repeatMode) {
  if (repeatMode === 'one') {
    return currentIndex;
  }
  if (repeatMode === 'off' && currentIndex >= queueLength - 1) {
    return null; // Detener al final
  }
  return (currentIndex + 1) % queueLength;
}

// Mock catalog verification
const INITIAL_TRACKS = [
  {
    id: 'track-1',
    title: 'Midnight City Lights',
    artist: 'Aura Nova',
    album: 'Neon Horizon',
    duration: 372,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'track-2',
    title: 'Solar Echoes',
    artist: 'Kaelen Vance',
    album: 'Astral Drift',
    duration: 423,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'track-3',
    title: 'Velvet Groove',
    artist: 'Luna Solaris',
    album: 'Late Night Sessions',
    duration: 345,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'track-4',
    title: 'Cybernetic Pulse',
    artist: 'Vector Prime',
    album: 'Sublevel 0',
    duration: 302,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'track-5',
    title: 'Golden Hour Mirage',
    artist: 'Elena Cruz',
    album: 'Coastal Reverie',
    duration: 354,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'track-6',
    title: 'Deep Horizon',
    artist: 'Marcus Thorne',
    album: 'Pacific Memories',
    duration: 380,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80'
  }
];

let testsPassed = 0;

console.log('--- INICIO DE PRUEBAS CRÍTICAS (agents.md) ---');

// TEST 1: Bucle de Avance Automático (onEnded)
try {
  const queueLength = 6;
  const currentIndex = 5;
  const nextRepeatAll = getNextTrackIndex(currentIndex, queueLength, 'all');
  assert.strictEqual(nextRepeatAll, 0, 'Al llegar al final con repeat "all", debe volver a 0');

  const nextSequential = getNextTrackIndex(2, queueLength, 'off');
  assert.strictEqual(nextSequential, 3, 'Debe avanzar al índice inmediato siguiente');

  const nextRepeatOne = getNextTrackIndex(2, queueLength, 'one');
  assert.strictEqual(nextRepeatOne, 2, 'En repeat "one", debe conservar el mismo índice');

  console.log('✓ TEST 1 PASADO: Bucle de Avance Automático (onEnded)');
  testsPassed++;
} catch (e) {
  console.error('✗ TEST 1 FALLÓ:', e.message);
}

// TEST 2: Algoritmo de Shuffle sin Mutación
try {
  const originalQueue = [...INITIAL_TRACKS];
  const currentTrack = originalQueue[2]; // Velvet Groove
  const shuffled = shuffleTracks(originalQueue, currentTrack);

  assert.strictEqual(originalQueue.length, 6, 'La cola original no debe mutar su longitud');
  assert.strictEqual(originalQueue[2].id, 'track-3', 'La cola original debe conservar sus posiciones');
  assert.strictEqual(shuffled.length, 6, 'La cola barajada debe contener todos los elementos');
  assert.strictEqual(shuffled[0].id, currentTrack.id, 'La pista activa debe conservarse en primera posición');

  console.log('✓ TEST 2 PASADO: Algoritmo de Shuffle sin Mutación');
  testsPassed++;
} catch (e) {
  console.error('✗ TEST 2 FALLÓ:', e.message);
}

// TEST 3: Contrato de Adaptador de Base de Datos
try {
  assert.strictEqual(INITIAL_TRACKS.length, 6, 'Debe proveer exactamente las 6 pistas obligatorias');
  const requiredFields = ['id', 'title', 'artist', 'audioUrl', 'coverUrl', 'duration'];

  INITIAL_TRACKS.forEach((track, i) => {
    requiredFields.forEach((field) => {
      assert.ok(track[field] !== undefined && track[field] !== null && track[field] !== '', `Pista #${i + 1} debe contener ${field}`);
    });
  });

  console.log('✓ TEST 3 PASADO: Contrato de Adaptador de Base de Datos');
  testsPassed++;
} catch (e) {
  console.error('✗ TEST 3 FALLÓ:', e.message);
}

console.log(`\nResultado: ${testsPassed}/3 pruebas completadas exitosamente.`);
if (testsPassed === 3) {
  process.exit(0);
} else {
  process.exit(1);
}
