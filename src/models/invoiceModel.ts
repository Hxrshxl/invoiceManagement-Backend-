import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { BaseEntity } from "./baseEntity";
import { IInvoice } from "../interfaces/invoiceInterface";

class Invoice extends BaseEntity implements IInvoice {
  public invoiceUId!: string;
  public sowId!: string;
  public sowPaymentPlanId!: string;
  public customerId!: string;
  public status!: "Drafted" | "Approved" | "Cancelled";
  public totalInvoiceValue!: number;
  public invoiceAmount!: number;
  public invoiceTaxAmount!: number;
  public invoiceSentOn!: Date;
  public paymentReceivedOn!: Date;
  public invoiceVersionNo!: number;
  public paymentId!: string;
}

Invoice.init(
  {
    ...BaseEntity.baseFields,
    invoiceUId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    sowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sows",
        key: "id",
      },
    },
    sowPaymentPlanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sow_payment_plans",
        key: "id",
      },
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("Drafted", "Approved", "Cancelled"),
      allowNull: false,
      defaultValue: "Drafted",
    },
    totalInvoiceValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    invoiceAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    invoiceTaxAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    invoiceSentOn: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    paymentReceivedOn: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    invoiceVersionNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    paymentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "invoices",
    timestamps: true,
  }
);

export default Invoice;