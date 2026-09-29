# Plan de Especificación y Arquitectura: Reproductor de Música Web

## 1. Visión General del Proyecto

Desarrollar una aplicación web interactiva de streaming y reproducción de música utilizando **Next.js (App Router)**, **React**, **HTML5 Audio API**, **CSS / Tailwind CSS** y **TypeScript**. La plataforma contará con autenticación de usuarios, persistencia desacoplada de preferencias (favoritos, volumen, listas de reproducción) en base de datos, un motor de audio robusto con reproducción continua y una arquitectura escalable para la ingesta dinámica de nuevas canciones.

---

## 2. Requerimientos Funcionales

| ID | Requerimiento | Descripción | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **RF-01** | Catálogo Inicial | Proveer un catálogo inicial de al menos 6 canciones precargadas con metadatos completos. | Colección inicial accesible con título, artista, álbum, duración, URL del archivo de audio y URL de carátula en alta resolución. |
| **RF-02** | Metadatos y Display | Visualización clara de carátula de álbum, título de pista, artista y álbum en reproducción. | Display visible tanto en el reproductor principal como en la barra persistente minimizada (Mini Player). |
| **RF-03** | Controles de Reproducción | Controles táctiles e interactivos: `Play`, `Pause`, `Previous`, `Next`, `Shuffle` (aleatorio) y `Repeat` (bucle: desactivado, repetir lista, repetir pista). | Respuesta instantánea con atajos de teclado y manipulación directa del elemento de audio HTML5. |
| **RF-04** | Medición Temporal y Scrubbing | Indicadores numéricos de `tiempo transcurrido` y `duración total` (`MM:SS`), junto a una barra de progreso interactiva. | Barra de progreso draggable/clickable (`seek`) que actualiza la posición del audio sin desincronización ni ruidos parásitos. |
| **RF-05** | Reproducción Continua (Autoplay) | Al finalizar una pista (`onEnded`), avanzar de forma automática a la siguiente canción en la cola. | Respeta el modo activo (`Shuffle`, `Repeat One`, o reproducción secuencial). Transición fluida sin congelamiento de UI. |
| **RF-06** | Diseño Adaptable (Responsive) | Experiencia adaptada a resoluciones móviles ($\le 768\text{px}$) y de escritorio ($\ge 1024\text{px}$). | Modo barra inferior expandible/modal en móviles y panel lateral con reproductor flotante en escritorio. |
| **RF-07** | Autenticación y Perfil | Módulo de Login/Registro de usuarios para personalización de la experiencia. | Sesión persistente mediante cookies/tokens JWT con middleware de protección de rutas privadas. |
| **RF-08** | Persistencia de Preferencias | Guardado en base de datos de configuraciones del usuario: canciones favoritas (`likes`), nivel de volumen, última canción escuchada y posición temporal. | Sincronización asíncrona mediante endpoints modulares listos para conectar cualquier ORM/driver de BD. |
| **RF-09** | Extensibilidad de Catálogo | Arquitectura de datos preparada para registrar y almacenar nuevas pistas en el futuro. | Endpoints REST/Server Actions tipados para `POST /api/tracks` con validación de metadatos y subida/referencia de assets de audio y carátula. |

---

## 3. Arquitectura del Sistema y Capa de Datos

### 3.1. Estructura de Directorios (Next.js App Router)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx                 # Catálogo principal / Home
│   │   ├── favorites/
│   │   │   └── page.tsx             # Pistas marcadas como favoritas
│   │   └── upload/
│   │       └── page.tsx             # Panel extensible para subir canciones
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # O endpoints manuales de autenticación
│   │   ├── tracks/
│   │   │   ├── route.ts             # GET (catálogo), POST (nueva pista)
│   │   │   └── [id]/route.ts        # GET, PUT, DELETE
│   │   └── user/
│   │       └── preferences/
│   │           └── route.ts         # GET, PATCH (favoritos, volumen, historial)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── audio/
│   │   ├── AudioPlayer.tsx          # Contenedor global del elemento <audio>
│   │   ├── PlayerControls.tsx       # Botones Play/Pause, Next, Prev, Shuffle, Repeat
│   │   ├── ProgressBar.tsx          # Seekbar interactiva y timestamps
│   │   ├── VolumeSlider.tsx         # Control de ganancia/volumen
│   │   └── TrackInfo.tsx            # Portada, título, artista y botón de favorito
│   ├── layout/
│   │   ├── Sidebar.tsx              # Navegación escritorio
│   │   ├── BottomNav.tsx            # Navegación móvil
│   │   └── Header.tsx               # Barra superior con estado de sesión
│   ├── tracks/
│   │   ├── TrackList.tsx            # Grilla/lista de canciones con filtrado
│   │   └── TrackCard.tsx            # Card con carátula e indicador de reproducción
│   └── ui/                          # Modales, botones, inputs reutilizables
├── context/
│   ├── AudioContext.tsx             # Estado global del reproductor y audio hook
│   └── AuthContext.tsx              # Estado de la sesión del usuario
├── hooks/
│   ├── useAudioPlayer.ts            # Enlace con HTMLAudioElement y listeners
│   └── useKeyboardShortcuts.ts     # Espacio (Play/Pause), flechas (Seek/Volume)
├── lib/
│   ├── audio-constants.ts           # 6 canciones iniciales y configuración por defecto
│   └── db/
│       ├── adapter.ts               # Capa desacoplada (interfaz del repositorio de BD)
│       └── mock-adapter.ts          # Implementación en memoria/fallback
└── types/
    ├── audio.ts                     # Interfaces de Track, PlaybackState, RepeatMode
    └── user.ts                      # Interfaces de User, UserPreferences
```

---

## 4. Definición de Modelos e Interfaces (`TypeScript`)

### 4.1. Dominio de Audio (`types/audio.ts`)

```typescript
export type RepeatMode = 'off' | 'all' | 'one';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;        // Duración en segundos
  audioUrl: string;        // URL remota o path estático (/audio/track-1.mp3)
  coverUrl: string;        // URL remota o path estático (/covers/cover-1.jpg)
  genre?: string;
  releaseYear?: number;
  createdAt: string;
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;     // Segundos transcurridos
  duration: number;        // Duración total de la pista actual
  volume: number;          // Rango 0.0 a 1.0
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Track[];          // Cola de reproducción ordenada
  originalQueue: Track[];  // Respaldo de orden para desactivar Shuffle
  currentIndex: number;
}
```

### 4.2. Dominio de Usuario y Preferencias (`types/user.ts`)

```typescript
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
```

---

## 5. Máquina de Estados y Lógica del Motor de Audio

### 5.1. Ciclo de Vida del Reproductor

```text
[DETENIDO / IDLE]
       │ (Seleccionar pista / Play)
       ▼
   [CARGANDO] ────(canplay / loadedmetadata)────► [REPRODUCIENDO]
       ▲                                               │
       │                                       (Pause) │ (Seek)
       │                                               ▼
       ├─────────────────────────────────────── [EN PAUSA]
       │
       ▼ (onEnded)
  ¿Modo Activo?
       ├─► Repeat 'one' ──► Reiniciar misma pista (currentTime = 0, Play)
       ├─► Repeat 'all' ──► Siguiente índice (o índice 0 si es el final)
       ├─► Repeat 'off' ──► Siguiente índice (Detener si es el final de cola)
       └─► Shuffle      ──► Seleccionar pista pseudoaleatoria no repetida
```

### 5.2. Reglas de Transición y Algoritmo de Shuffle

* **Cola Secuencial:** Mantiene el arreglo original intacto (`originalQueue`).
* **Activación de Shuffle:** Genera una copia barajada utilizando el algoritmo de **Fisher-Yates**, asegurando que la canción que se está reproduciendo actualmente permanezca en la primera posición para evitar saltos abruptos.
* **Desactivación de Shuffle:** Restaura la cola al orden de `originalQueue` e indexa la posición de la pista en curso.
* **Control de Seek / Scrubbing:**
  * Al iniciar el arrastre (`onMouseDown` / `onTouchStart`): pausar temporalmente la actualización periódica del slider para evitar saltos visuales.
  * Durante el arrastre: actualizar únicamente el contador visual de tiempo.
  * Al soltar (`onMouseUp` / `onTouchEnd`): asignar `audioElement.currentTime = nuevoTiempo`.

---

## 6. Diseño Responsivo y Estrategia de UI

### 6.1. Vista Escritorio ($\ge 1024\text{px}$)
* **Layout de 3 Columnas/Bloques:**
  1. **Barra Lateral Izquierda:** Navegación, playlists, biblioteca, accesos a Favoritos y botón "Añadir Canción".
  2. **Área Central:** Banner de pista destacada, listado de canciones con columnas (`#`, `Título`, `Álbum`, `Duración`, `Favorito`).
  3. **Barra Inferior Fija (Persistent Bottom Player):**
     * Izquierda: Carátula (64x64px), Título, Artista, Botón de Like interactivo.
     * Centro: Controles (`Prev`, `Play/Pause`, `Next`, `Shuffle`, `Repeat`) y barra de progreso con timestamps a los extremos.
     * Derecha: Indicador de cola, botón de mute y slider de volumen.

### 6.2. Vista Móvil ($\le 768\text{px}$)
* **Mini Player Flotante:** Barra compacta sobre la barra de navegación inferior con carátula pequeña, título en marquesina si es largo, botón Play/Pause y barra de progreso ultradelgada (2px) en el borde superior.
* **Full-Screen Player Modal:** Al tocar el Mini Player, se abre una vista modal a pantalla completa con carátula expandida (1:1 aspect ratio), controles de gran tamaño táctil ($\ge 48\text{px}$) y barra seek apta para manipulación táctil.

---

## 7. Capa de Abstracción de Base de Datos (Persistencia Desacoplada)

Para mantener la base de datos totalmente desacoplada hasta recibir las instrucciones específicas, se define un contrato de repositorio (`Data Access Layer`):

```typescript
// lib/db/adapter.ts
export interface IDatabaseAdapter {
  // Pistas
  getAllTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | null>;
  createTrack(trackData: Omit<Track, 'id' | 'createdAt'>): Promise<Track>;

  // Preferencias y Usuario
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updateUserPreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void>;
  toggleFavorite(userId: string, trackId: string): Promise<boolean>;
}
```

* Inicialmente, la aplicación consumirá `lib/db/mock-adapter.ts` inicializado con las **6 pistas estáticas requeridas**.
* Cuando se suministren las instrucciones de la BD, solo se reemplazará la implementación interna del adaptador sin alterar ningún componente de React ni el motor de audio.

---

## 8. Fases de Implementación Técnica

1. **Fase 1: Motor de Audio y Estado Global**
   * Configurar `AudioContext` y el hook `useAudioPlayer`.
   * Implementar cola de reproducción, carga de las 6 pistas iniciales, Play/Pause, Seek, volumen y transiciones automáticas `onEnded`.

2. **Fase 2: Interfaz de Usuario y Controles (Mobile-First & Desktop)**
   * Implementar el Mini Player, el reproductor de pantalla completa para móviles y la barra inferior de escritorio.
   * Diseñar la lista de canciones interactiva con estados de reproducción activos y visualización de carátulas.

3. **Fase 3: Autenticación y Capa de Preferencias**
   * Formularios de Login y Registro de usuario con validación de inputs.
   * Implementar la gestión de favoritos (`Likes`), retención de volumen y última canción escuchada.

4. **Fase 4: Módulo de Extensibilidad (Ingesta de Nuevas Pistas)**
   * Formulario para añadir nuevas canciones (metadatos, URL de carátula y archivo de audio).
   * Validaciones de entrada y actualización en tiempo real de la cola sin necesidad de recargar la aplicación.

5. **Fase 5: Optimización y Conexión de Base de Datos**
   * Pulido de atajos de teclado, transiciones y pruebas de hidratación en Next.js.
   * Acoplamiento del driver/ORM final de base de datos una vez provistas las especificaciones.