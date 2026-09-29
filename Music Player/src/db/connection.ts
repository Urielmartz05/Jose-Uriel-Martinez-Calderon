import { Sequelize } from 'sequelize';
import path from 'path';
import sqlite3 from 'sqlite3';

const isProduction = process.env.NODE_ENV === 'production';

declare global {
  // eslint-disable-next-line no-var
  var __sequelizeInstance: Sequelize | undefined;
}

export const sequelize =
  globalThis.__sequelizeInstance ||
  (isProduction && process.env.DATABASE_URL
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
        dialectModule: sqlite3,
        storage: path.join(process.cwd(), 'database.sqlite'),
        logging: false,
      }));

if (!isProduction) {
  globalThis.__sequelizeInstance = sequelize;
}
