import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

export interface GameSessionAttributes {
  id: string;
  userId: string;
  categoryId: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  score: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  heartsLeft: number;
  finishedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GameSessionCreationAttributes = Optional<
  GameSessionAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class GameSession
  extends Model<GameSessionAttributes, GameSessionCreationAttributes>
  implements GameSessionAttributes
{
  declare id: string;
  declare userId: string;
  declare categoryId: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  declare score: number;
  declare correctCount: number;
  declare incorrectCount: number;
  declare percentage: number;
  declare heartsLeft: number;
  declare finishedAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

GameSession.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    correctCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    incorrectCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    percentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      allowNull: false,
    },
    heartsLeft: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
    },
    finishedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'game_sessions',
    modelName: 'GameSession',
    timestamps: true,
  }
);

export default GameSession;
