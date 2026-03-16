import { DataTypes, Model } from "sequelize";

export abstract class BaseEntity extends Model {
  public id!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static baseFields = {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  };
}