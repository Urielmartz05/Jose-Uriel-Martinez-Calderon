import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';
import type { User } from './User';

export type AppTheme = 'dark' | 'light' | 'apple-classic';
export type EqualizerPreset = 'flat' | 'bass-boost' | 'vocal' | 'rock' | string;

export interface UserSettingsAttributes {
  id: string;
  userId: string;
  defaultVolume: number;
  autoPlayNext: boolean;
  theme: AppTheme;
  preferredEqualizer: EqualizerPreset;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserSettingsCreationAttributes = Optional<UserSettingsAttributes, 'id'>;

export class UserSettings extends Model<UserSettingsAttributes, UserSettingsCreationAttributes> implements UserSettingsAttributes {
  public id!: string;
  public userId!: string;
  public defaultVolume!: number;
  public autoPlayNext!: boolean;
  public theme!: AppTheme;
  public preferredEqualizer!: EqualizerPreset;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public user?: User;
}

UserSettings.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    defaultVolume: {
      type: DataTypes.FLOAT,
      defaultValue: 0.8,
      validate: { min: 0.0, max: 1.0 },
    },
    autoPlayNext: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    theme: {
      type: DataTypes.ENUM('dark', 'light', 'apple-classic'),
      defaultValue: 'dark',
    },
    preferredEqualizer: {
      type: DataTypes.STRING(30),
      defaultValue: 'flat',
    },
  },
  {
    sequelize,
    tableName: 'user_settings',
  }
);
