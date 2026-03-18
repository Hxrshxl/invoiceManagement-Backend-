import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { BaseEntity } from "./baseEntity";
import { IPayment } from "../interfaces/paymentInterface";

class Payment extends BaseEntity implements IPayment {
  public paymentUId!: string;
  public invoiceId!: string;
  public paymentDate!: Date;
  public forExAmount!: number;
  public currency!: string;
  public indianAmount!: number;
  public isFullPayment!: boolean;
  public bankPayment!: string;
  public details!: string;
}

Payment.init(
  {
    ...BaseEntity.baseFields,
    paymentUId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "invoices",
        key: "id",
      },
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    forExAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    indianAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    isFullPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    bankPayment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "payments",
    timestamps: true,
  }
);

export default Payment;