import sequelize from './connection';
import User from './models/User';
import UserProgress, { Progress } from './models/UserProgress';
import Question from './models/Question';
import GameSession from './models/GameSession';

import { questionsData } from '../data/questions';

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

    // Seed questions if not already populated
    const count = await Question.count();
    if (count === 0) {
      const allQuestions = Object.values(questionsData).flat();
      await Question.bulkCreate(
        allQuestions.map((q) => ({
          id: q.id,
          categoryId: q.categoryId,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        }))
      );
    }

    isDbInitialized = true;
    return sequelize;
  } catch (error) {
    console.error('Sequelize database initialization error:', error);
    throw error;
  }
}

export { sequelize, User, UserProgress, Progress, Question, GameSession };
