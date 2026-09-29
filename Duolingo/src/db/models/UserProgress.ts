import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../connection';

export interface UserProgressAttributes {
  id: string;
  userId: string;
  categoryId: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  completed: boolean;
  highscore: number;
  bestAccuracy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserProgressCreationAttributes = Optional<
  UserProgressAttributes,
  'id' | 'completed' | 'highscore' | 'bestAccuracy'
>;

export class UserProgress
  extends Model<UserProgressAttributes, UserProgressCreationAttributes>
  implements UserProgressAttributes
{
  public id!: string;
  public userId!: string;
  public categoryId!: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'word_problems';
  public completed!: boolean;
  public highscore!: number;
  public bestAccuracy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProgress.init(
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
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    highscore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    bestAccuracy: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_progress',
    modelName: 'UserProgress',
    timestamps: true,
  }
);

export const Progress = UserProgress;
export default UserProgress;
