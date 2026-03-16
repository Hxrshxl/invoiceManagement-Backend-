import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { ISowPaymentPlan } from "../interfaces/sowPaymentPlanInterface";
import { BaseEntity } from "./baseEntity";

class SowPaymentPlan extends BaseEntity implements ISowPaymentPlan {
  public sowId!: string;
  public customerId!: string;
  public plannedInvoiceDate!: Date;
  public totalActualAmount!: number;
}

SowPaymentPlan.init(
  {
    ...BaseEntity.baseFields,
    sowId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sows",
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
    plannedInvoiceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalActualAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "sow_payment_plans",
    timestamps: true,
  }
);

export default SowPaymentPlan;