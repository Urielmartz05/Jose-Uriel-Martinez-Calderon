import sequelize from './connection';
import User from './models/User';
import UserProgress, { Progress } from './models/UserProgress';
import Question from './models/Question';
import GameSession from './models/GameSession';

User.hasMany(UserProgress, { foreignKey: 'userId', as: 'progressList' });
UserProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(GameSession, { foreignKey: 'userId', as: 'gameSessions' });
GameSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

let isDbInitialized = false;

export async function initDB() {
  if (isDbInitialized) return sequelize;
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    isDbInitialized = true;
    return sequelize;
  } catch (error) {
    console.error('Sequelize database initialization error:', error);
    throw error;
  }
}

export { sequelize, User, UserProgress, Progress, Question, GameSession };
