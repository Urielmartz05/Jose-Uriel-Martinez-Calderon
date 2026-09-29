import { sequelize } from './connection';
import { User } from './models/User';
import { UserSettings } from './models/UserSettings';
import { Song } from './models/Song';

User.hasOne(UserSettings, { foreignKey: 'userId', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Song, { foreignKey: 'uploaderId', as: 'uploadedSongs' });
Song.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

let isInitialized = false;

export const initDB = async (): Promise<void> => {
  if (isInitialized) return;
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL no está configurada. Añade una conexión PostgreSQL en las variables de entorno de Vercel.'
    );
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    isInitialized = true;
    console.log('[DB] Conexión y sincronización de modelos exitosa.');
  } catch (error) {
    console.error('[DB] Error de inicialización:', error);
    throw error;
  }
};

export { sequelize, User, UserSettings, Song };
