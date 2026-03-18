import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { BaseEntity } from "./baseEntity";
import { ISow } from "../interfaces/sowInterface";

class Sow extends BaseEntity implements ISow {
  public sowUId!: string;
  public customerId!: string;
  public title!: string;
  public totalValue!: number;
  public currency!: string;
  public validFrom!: Date;
  public validUpto!: Date;
  public customerPONumber!: string;
  public customerSONumber!: string;
  public invoiceEmailAddresses!: string[];
}

Sow.init(
  {
    ...BaseEntity.baseFields,
    sowUId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    validFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    validUpto: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    customerPONumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerSONumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceEmailAddresses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "sows",
    timestamps: true,
  }
);

export default Sow;