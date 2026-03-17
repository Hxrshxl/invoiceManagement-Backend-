import Organization from "./organizationModel";
import Customer from "./customerModel";
import Sow from "./sowModel";
import SowPaymentPlan from "./sowPaymentPlanModel";
import SowPaymentPlanLineItem from "./sowPaymentPlanLineItemModel";
import Invoice from "./invoiceModel";
import InvoiceLineItem from "./invoiceLineItemModel";
import Payment from "./paymentModel";

// ─── Organization → Customer ──────────────────────────────────────────────────
Organization.hasMany(Customer, { foreignKey: "organizationId" });
Customer.belongsTo(Organization, { foreignKey: "organizationId" });

// ─── Customer → SOW ───────────────────────────────────────────────────────────
Customer.hasMany(Sow, { foreignKey: "customerId" });
Sow.belongsTo(Customer, { foreignKey: "customerId" });

// ─── SOW → SOWPaymentPlan ─────────────────────────────────────────────────────
Sow.hasMany(SowPaymentPlan, { foreignKey: "sowId" });
SowPaymentPlan.belongsTo(Sow, { foreignKey: "sowId" });

// ─── Customer → SOWPaymentPlan ────────────────────────────────────────────────
Customer.hasMany(SowPaymentPlan, { foreignKey: "customerId" });
SowPaymentPlan.belongsTo(Customer, { foreignKey: "customerId" });

// ─── SOWPaymentPlan → SOWPaymentPlanLineItem ──────────────────────────────────
SowPaymentPlan.hasMany(SowPaymentPlanLineItem, {
  foreignKey: "sowPaymentPlanId",
  as: "SowPaymentPlanLineItems",
});
SowPaymentPlanLineItem.belongsTo(SowPaymentPlan, {
  foreignKey: "sowPaymentPlanId",
});

// ─── SOW → SOWPaymentPlanLineItem ─────────────────────────────────────────────
Sow.hasMany(SowPaymentPlanLineItem, { foreignKey: "sowId" });
SowPaymentPlanLineItem.belongsTo(Sow, { foreignKey: "sowId" });

// ─── SOW → Invoice ────────────────────────────────────────────────────────────
Sow.hasMany(Invoice, { foreignKey: "sowId" });
Invoice.belongsTo(Sow, { foreignKey: "sowId" });

// ─── Customer → Invoice ───────────────────────────────────────────────────────
Customer.hasMany(Invoice, { foreignKey: "customerId" });
Invoice.belongsTo(Customer, { foreignKey: "customerId" });

// ─── SOWPaymentPlan → Invoice ─────────────────────────────────────────────────
SowPaymentPlan.hasMany(Invoice, {
  foreignKey: "sowPaymentPlanId",
  as: "Invoices",
});
Invoice.belongsTo(SowPaymentPlan, { foreignKey: "sowPaymentPlanId" });

// ─── Invoice → InvoiceLineItem ────────────────────────────────────────────────
Invoice.hasMany(InvoiceLineItem, {
  foreignKey: "invoiceId",
  as: "InvoiceLineItems",
});
InvoiceLineItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

// ─── Invoice → Payment ────────────────────────────────────────────────────────
Invoice.hasOne(Payment, { foreignKey: "invoiceId" });
Payment.belongsTo(Invoice, { foreignKey: "invoiceId" });

export {
  // sequelize,
  Organization,
  Customer,
  Sow,
  SowPaymentPlan,
  SowPaymentPlanLineItem,
  Invoice,
  InvoiceLineItem,
  Payment,
};