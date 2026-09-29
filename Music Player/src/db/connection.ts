import { Sequelize } from 'sequelize';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

declare global {
  // eslint-disable-next-line no-var
  var __sequelizeInstance: Sequelize | undefined;
}

function createSequelizeInstance(): Sequelize {
  if (hasDatabaseUrl) {
    return new Sequelize(process.env.DATABASE_URL as string, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite3 = require('sqlite3');
  return new Sequelize({
    dialect: 'sqlite',
    dialectModule: sqlite3,
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: false,
  });
}

export const sequelize =
  globalThis.__sequelizeInstance || createSequelizeInstance();

if (!isProduction) {
  globalThis.__sequelizeInstance = sequelize;
}
