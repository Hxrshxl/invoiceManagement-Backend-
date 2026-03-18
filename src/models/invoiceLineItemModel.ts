import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { BaseEntity } from "./baseEntity";
import { IInvoiceLineItem } from "../interfaces/invoiceLineItemInterface";

class InvoiceLineItem extends BaseEntity implements IInvoiceLineItem {
  public invoiceLineItemUId!: string;
  public invoiceId!: string;
  public orderNo!: string;
  public particular!: string;
  public rate!: number;
  public unit!: number;
  public total!: number;
}

InvoiceLineItem.init(
  {
    ...BaseEntity.baseFields,
    invoiceLineItemUId: {
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
    orderNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    particular: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "invoice_line_items",
    timestamps: true,
  }
);

export default InvoiceLineItem;