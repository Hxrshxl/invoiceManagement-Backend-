import { DataTypes, Model } from "sequelize";

export abstract class BaseEntity extends Model {
  public id!: string;
  public version!: number;
  public archive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static baseFields = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    archive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  };
}