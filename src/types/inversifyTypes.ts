const TYPES = {
  Logger: Symbol.for("Logger"),

  OrganizationService: Symbol.for("OrganizationService"),
  OrganizationController: Symbol.for("OrganizationController"),

  CustomerService: Symbol.for("CustomerService"),
  CustomerController: Symbol.for("CustomerController"),

  SowService: Symbol.for("SowService"),
  SowController: Symbol.for("SowController"),

  SowPaymentPlanService: Symbol.for("SowPaymentPlanService"),
  SowPaymentPlanController: Symbol.for("SowPaymentPlanController"),

  SowPaymentPlanLineItemService: Symbol.for("SowPaymentPlanLineItemService"),
  SowPaymentPlanLineItemController: Symbol.for("SowPaymentPlanLineItemController"),

  InvoiceService: Symbol.for("InvoiceService"),
  InvoiceController: Symbol.for("InvoiceController"),

  InvoiceLineItemService: Symbol.for("InvoiceLineItemService"),
  InvoiceLineItemController: Symbol.for("InvoiceLineItemController"),

  PaymentService: Symbol.for("PaymentService"),
  PaymentController: Symbol.for("PaymentController"),
};

export default TYPES;