# Especificación Complementaria y Base de Datos: Music Player (plan2.md)

## 1. Visión General del Módulo
Este documento complementa a `plan.md` implementando los requerimientos pendientes del reproductor de música:
- Aprovisionamiento y conexión de base de datos relacional mediante Sequelize.
- Autenticación segura de usuarios (Login / Registro / Sesiones JWT).
- Preferencias de usuario persistentes (volumen por defecto, tema, ecualizador/preset, reproducción aleatoria/bucle).
- Módulo de ingesta y carga para incorporar nuevas canciones dinámicamente en el futuro.

---

## 2. Aprovisionamiento y Configuración de Base de Datos

### 2.1. Conexión Dual (SQLite en desarrollo / PostgreSQL en producción)

Archivo: `src/db/connection.ts`
```typescript
import { Sequelize } from 'sequelize';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export const sequelize = isProduction
  ? new Sequelize(process.env.DATABASE_URL as string, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(process.cwd(), 'database.sqlite'),
      logging: false,
    });
```

---

## 3. Modelos de Datos en Sequelize

### 3.1. Modelo `User`
Almacena credenciales de acceso e información de identidad.

```typescript
// src/db/models/User.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection';

export class User extends Model {
  public id!: string;
  public username!: string;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);
```

### 3.2. Modelo `UserSettings`
Persiste las opciones de configuración y personalización de la experiencia por cada usuario.

```typescript
// src/db/models/UserSettings.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection';

export class UserSettings extends Model {
  public id!: string;
  public userId!: string;
  public defaultVolume!: number;      // Escala 0.0 a 1.0
  public autoPlayNext!: boolean;      // Salto automático activado
  public theme!: string;              // 'dark' | 'light' | 'apple-classic'
  public preferredEqualizer!: string; // 'flat' | 'bass-boost' | 'vocal' | 'rock'
}

UserSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    defaultVolume: {
      type: DataTypes.FLOAT,
      defaultValue: 0.8,
      validate: { min: 0.0, max: 1.0 },
    },
    autoPlayNext: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    theme: {
      type: DataTypes.ENUM('dark', 'light', 'apple-classic'),
      defaultValue: 'dark',
    },
    preferredEqualizer: {
      type: DataTypes.STRING(30),
      defaultValue: 'flat',
    },
  },
  {
    sequelize,
    tableName: 'user_settings',
  }
);
```

### 3.3. Modelo `Song`
Estructura relacional de las canciones para soportar el catálogo inicial (6 temas) y la adición continua de nuevas pistas.

```typescript
// src/db/models/Song.ts
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection';

export class Song extends Model {
  public id!: string;
  public title!: string;
  public artist!: string;
  public album!: string;
  public duration!: number;     // En segundos
  public coverUrl!: string;     // URL o path de la carátula
  public audioUrl!: string;     // URL o path del archivo de audio (.mp3, .m4a, .aac)
  public genre!: string;
  public uploaderId!: string | null;
}

Song.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING(150),
      defaultValue: 'Single',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    coverUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audioUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING(50),
      defaultValue: 'Pop',
    },
    uploaderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'songs',
  }
);
```

### 3.4. Relaciones y Sincronización

```typescript
// src/db/index.ts
import { sequelize } from './connection';
import { User } from './models/User';
import { UserSettings } from './models/UserSettings';
import { Song } from './models/Song';

User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Song, { foreignKey: 'uploaderId', as: 'uploadedSongs' });
Song.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

export const initDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('[DB] Conexión y sincronización de modelos exitosa.');
  } catch (error) {
    console.error('[DB] Error de inicialización:', error);
  }
};

export { sequelize, User, UserSettings, Song };
```

---

## 4. Endpoints de API REST (Next.js App Router)

### 4.1. Autenticación (`/api/auth`)
- **`POST /api/auth/register`**:
  - Parámetros: `{ username, email, password }`.
  - Hashea con `bcryptjs` (salt rounds: 10).
  - Inserta el registro `User` y crea automáticamente una entrada vinculada en `UserSettings` con los valores por omisión.
- **`POST /api/auth/login`**:
  - Valida credenciales contra `User`.
  - Emite una cookie segura `httpOnly` con token JWT (`maxAge`: 7 días).
  - Devuelve datos del usuario y sus `settings`.
- **`GET /api/auth/me`**:
  - Obtiene la sesión actual desde la cookie y retorna la información activa.

### 4.2. Opciones Personalizadas (`/api/user/settings`)
- **`GET /api/user/settings`**: Retorna las preferencias del usuario logueado.
- **`PUT /api/user/settings`**: Actualiza preferencias de volumen, ecualizador o temas en la base de datos:
  ```json
  {
    "defaultVolume": 0.65,
    "theme": "dark",
    "preferredEqualizer": "bass-boost",
    "autoPlayNext": true
  }
  ```

### 4.3. Gestión del Catálogo de Canciones (`/api/songs`)
- **`GET /api/songs`**:
  - Devuelve la lista completa de canciones disponibles (mínimo las 6 iniciales) ordenadas cronológicamente o por título.
- **`POST /api/songs`** *(Añadir nueva canción en el futuro)*:
  - Ruta protegida (requiere sesión activa).
  - Recibe:
    ```json
    {
      "title": "Midnight City",
      "artist": "M83",
      "album": "Hurry Up, We're Dreaming",
      "duration": 243,
      "coverUrl": "https://images.unsplash.com/photo-...",
      "audioUrl": "https://cdn.example.com/audio/track07.mp3",
      "genre": "Synthwave"
    }
    ```
  - Inserta el registro en la tabla `songs` y asigna `uploaderId`.

---

## 5. Script de Semillado Inicial (Seeder con 6 Canciones)

Archivo: `src/db/seed.ts`
```typescript
import { Song, initDB } from './index';

const initialTracks = [
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

export async function seedDatabase() {
  await initDB();
  const count = await Song.count();
  if (count === 0) {
    await Song.bulkCreate(initialTracks);
    console.log('[Seeder] 6 canciones iniciales insertadas con éxito.');
  }
}
```

---

## 6. Procedimiento de Ejecución e Integración

1. **Instalar paquetes necesarios:**
   ```bash
   npm install sequelize sqlite3 bcryptjs jsonwebtoken
   npm install --save-dev @types/bcryptjs @types/jsonwebtoken
   ```
2. **Cargar la base de datos al arrancar:** invocar `seedDatabase()` en el arranque del servidor o a través de un script npm dedicado (`npm run db:seed`).
3. **Persistencia en el Frontend:**
   - Al autenticar un usuario, el contexto `PlayerContext` carga las configuraciones del usuario (`defaultVolume`, `theme`) guardadas en la base de datos.
   - Si el usuario modifica el volumen o tema en la interfaz, se emite una petición debounce a `PUT /api/user/settings` para sincronizar.