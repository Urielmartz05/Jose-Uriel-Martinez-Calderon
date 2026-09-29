import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

export interface QuestionAttributes {
  id: string;
  categoryId: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  prompt: string;
  options: string[]; // stored as JSON
  correctIndex: number;
  explanation: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type QuestionCreationAttributes = Optional<QuestionAttributes, 'id'>;

export class Question
  extends Model<QuestionAttributes, QuestionCreationAttributes>
  implements QuestionAttributes
{
  declare id: string;
  declare categoryId: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  declare prompt: string;
  declare options: string[];
  declare correctIndex: number;
  declare explanation: string;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    correctIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'questions',
    modelName: 'Question',
    timestamps: true,
  }
);

export default Question;
