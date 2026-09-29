import { Sequelize, Options } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

// Load .env and .env.local if available
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

declare global {
  // eslint-disable-next-line no-var
  var __sequelize_instance: Sequelize | undefined;
}

const isProduction = process.env.NODE_ENV === 'production';
const rawDatabaseUrl = process.env.DATABASE_URL;
const hasPlaceholder = Boolean(rawDatabaseUrl && rawDatabaseUrl.includes('[YOUR-PASSWORD]'));

if (hasPlaceholder) {
  console.warn('⚠️ [Sequelize] DATABASE_URL contiene "[YOUR-PASSWORD]". Por favor reemplázalo con tu contraseña en el archivo .env. Usando SQLite temporalmente.');
}

const databaseUrl = !hasPlaceholder ? rawDatabaseUrl : undefined;

import pg from 'pg';
import sqlite3 from 'sqlite3';

let sequelize: Sequelize;

if (databaseUrl) {
  const isPostgres = databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://');
  sequelize = global.__sequelize_instance || new Sequelize(databaseUrl, {
    dialect: isPostgres ? 'postgres' : undefined,
    dialectModule: isPostgres ? pg : undefined,
    logging: false,
    dialectOptions: isPostgres ? {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    } : {},
  });
} else {
  const sqliteStorage = path.resolve(process.cwd(), 'database.sqlite');
  const options: Options = {
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: sqliteStorage,
    logging: false,
  };

  sequelize = global.__sequelize_instance || new Sequelize(options);
}

if (!isProduction) {
  global.__sequelize_instance = sequelize;
}

export default sequelize;
