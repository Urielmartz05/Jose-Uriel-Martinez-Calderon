import { Sequelize, Options } from 'sequelize';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __sequelize_instance: Sequelize | undefined;
}

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let sequelize: Sequelize;

if (databaseUrl) {
  sequelize = global.__sequelize_instance || new Sequelize(databaseUrl, {
    logging: false,
    dialectOptions: databaseUrl.startsWith('postgres') ? {
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
    storage: sqliteStorage,
    logging: false,
  };

  sequelize = global.__sequelize_instance || new Sequelize(options);
}

if (!isProduction) {
  global.__sequelize_instance = sequelize;
}

export default sequelize;
