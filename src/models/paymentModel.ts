import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { IPayment } from "../interfaces/paymentInterface";
import { BaseEntity } from "./baseEntity";

class Payment extends BaseEntity implements IPayment {
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