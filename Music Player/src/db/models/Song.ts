import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../connection';
import type { User } from './User';

export interface SongAttributes {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  genre: string;
  uploaderId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SongCreationAttributes = Optional<SongAttributes, 'id' | 'album' | 'genre' | 'uploaderId'>;

export class Song extends Model<SongAttributes, SongCreationAttributes> implements SongAttributes {
  public id!: string;
  public title!: string;
  public artist!: string;
  public album!: string;
  public duration!: number;
  public coverUrl!: string;
  public audioUrl!: string;
  public genre!: string;
  public uploaderId!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public uploader?: User;
}

Song.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    artist: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    album: {
      type: DataTypes.STRING(150),
      defaultValue: 'Single',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    coverUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    audioUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING(50),
      defaultValue: 'Pop',
    },
    uploaderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'songs',
  }
);
