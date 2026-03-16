import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { ISowPaymentPlanLineItem } from "../interfaces/sowPaymentPlanLineItemInterface";
import { BaseEntity } from "./baseEntity";

class SowPaymentPlanLineItem extends BaseEntity implements ISowPaymentPlanLineItem {
  public sowPaymentPlanId!: string;
  public sowId!: string;
  public orderId!: string;
  public particular!: string;
  public rate!: number;
  public unit!: number;
  public total!: number;
}

SowPaymentPlanLineItem.init(
  {
    ...BaseEntity.baseFields,
    sowPaymentPlanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sow_payment_plans",
        key: "id",
      },
    },
    sowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sows",
        key: "id",
      },
    },
    orderId: {
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
    tableName: "sow_payment_plan_line_items",
    timestamps: true,
  }
);

export default SowPaymentPlanLineItem;