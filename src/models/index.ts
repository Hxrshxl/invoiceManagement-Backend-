import Organization from "./organizationModel";
import Customer from "./customerModel";
import Sow from "./sowModel";
import SowPaymentPlan from "./sowPaymentPlanModel";
import SowPaymentPlanLineItem from "./sowPaymentPlanLineItemModel";
import Invoice from "./invoiceModel";
import InvoiceLineItem from "./invoiceLineItemModel";
import Payment from "./paymentModel";

// Organization relationships
Organization.hasMany(Customer, { foreignKey: "organizationId" });
Customer.belongsTo(Organization, { foreignKey: "organizationId" });




// Customer relationships
Customer.hasMany(Sow, { foreignKey: "customerId" });
Sow.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(SowPaymentPlan, { foreignKey: "customerId" });
SowPaymentPlan.belongsTo(Customer, { foreignKey: "customerId" });

Customer.hasMany(Invoice, { foreignKey: "customerId" });
Invoice.belongsTo(Customer, { foreignKey: "customerId" });





// Sow relationships
Sow.hasMany(SowPaymentPlan, { foreignKey: "sowId" });
SowPaymentPlan.belongsTo(Sow, { foreignKey: "sowId" });

Sow.hasMany(SowPaymentPlanLineItem, { foreignKey: "sowId" });
SowPaymentPlanLineItem.belongsTo(Sow, { foreignKey: "sowId" });

Sow.hasMany(Invoice, { foreignKey: "sowId" });
Invoice.belongsTo(Sow, { foreignKey: "sowId" });





// SowPaymentPlan relationships
SowPaymentPlan.hasMany(SowPaymentPlanLineItem, {
  foreignKey: "sowPaymentPlanId",
  as: "SowPaymentPlanLineItems",
});
SowPaymentPlanLineItem.belongsTo(SowPaymentPlan, {
  foreignKey: "sowPaymentPlanId",
});

SowPaymentPlan.hasMany(Invoice, {
  foreignKey: "sowPaymentPlanId",
  as: "Invoices",
});
Invoice.belongsTo(SowPaymentPlan, { foreignKey: "sowPaymentPlanId" });






// Invoice relationships
Invoice.hasMany(InvoiceLineItem, {
  foreignKey: "invoiceId",
  as: "InvoiceLineItems",
});
InvoiceLineItem.belongsTo(Invoice, { foreignKey: "invoiceId" });

Invoice.hasOne(Payment, { foreignKey: "invoiceId" });
Payment.belongsTo(Invoice, { foreignKey: "invoiceId" });





export {
  Organization,
  Customer,
  Sow,
  SowPaymentPlan,
  SowPaymentPlanLineItem,
  Invoice,
  InvoiceLineItem,
  Payment,
};