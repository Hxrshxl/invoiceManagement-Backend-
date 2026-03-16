import sequelize from "../postgresDB/pgConfig";
import Organization from "./organizationModel";
import Customer from "./customerModel";
import Sow from "./sowModel";
import SowPaymentPlan from "./sowPaymentPlanModel";
import SowPaymentPlanLineItem from "./sowPaymentPlanLineItemModel";
import Invoice from "./invoiceModel";
import InvoiceLineItem from "./invoiceLineItemModel";
import Payment from "./paymentModel";

Organization.hasMany(Customer, { foreignKey: "organizationId" });
Customer.belongsTo(Organization, { foreignKey: "organizationId" });

Customer.hasMany(Sow, { foreignKey: "customerId" });
Sow.belongsTo(Customer, { foreignKey: "customerId" });

Sow.hasMany(SowPaymentPlan, { foreignKey: "sowId" });
SowPaymentPlan.belongsTo(Sow, { foreignKey: "sowId" });

SowPaymentPlan.hasMany(SowPaymentPlanLineItem, {
  foreignKey: "sowPaymentPlanId",
  as: "SowPaymentPlanLineItems",
});
SowPaymentPlanLineItem.belongsTo(SowPaymentPlan, {
  foreignKey: "sowPaymentPlanId",
});

Sow.hasMany(Invoice, { foreignKey: "sowId" });
Invoice.belongsTo(Sow, { foreignKey: "sowId" });

Customer.hasMany(Invoice, { foreignKey: "customerId" });
Invoice.belongsTo(Customer, { foreignKey: "customerId" });

SowPaymentPlan.hasMany(Invoice, { foreignKey: "sowPaymentPlanId" });
Invoice.belongsTo(SowPaymentPlan, { foreignKey: "sowPaymentPlanId" });

Invoice.hasMany(InvoiceLineItem, {
  foreignKey: "invoiceId",
  as: "InvoiceLineItems",
});
InvoiceLineItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

Invoice.hasOne(Payment, { foreignKey: "invoiceId" });
Payment.belongsTo(Invoice, { foreignKey: "invoiceId" });

export {
  sequelize,
  Organization,
  Customer,
  Sow,
  SowPaymentPlan,
  SowPaymentPlanLineItem,
  Invoice,
  InvoiceLineItem,
  Payment,
};