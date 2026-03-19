const TYPES = {
  Logger: Symbol.for("Logger"),

  // DB SERVICES
  OrganizationDbService:            Symbol.for("OrganizationDbService"),
  CustomerDbService:                Symbol.for("CustomerDbService"),
  SowDbService:                     Symbol.for("SowDbService"),
  SowPaymentPlanDbService:          Symbol.for("SowPaymentPlanDbService"),
  SowPaymentPlanLineItemDbService:  Symbol.for("SowPaymentPlanLineItemDbService"),
  InvoiceDbService:                 Symbol.for("InvoiceDbService"),
  InvoiceLineItemDbService:         Symbol.for("InvoiceLineItemDbService"),
  PaymentDbService:                 Symbol.for("PaymentDbService"),

  // SERVICES 
  OrganizationService:              Symbol.for("OrganizationService"),
  CustomerService:                  Symbol.for("CustomerService"),
  SowService:                       Symbol.for("SowService"),
  SowPaymentPlanService:            Symbol.for("SowPaymentPlanService"),
  SowPaymentPlanLineItemService:    Symbol.for("SowPaymentPlanLineItemService"),
  InvoiceService:                   Symbol.for("InvoiceService"),
  InvoiceLineItemService:           Symbol.for("InvoiceLineItemService"),
  PaymentService:                   Symbol.for("PaymentService"),

  //  CONTROLLERS 
  OrganizationController:           Symbol.for("OrganizationController"),
  CustomerController:               Symbol.for("CustomerController"),
  SowController:                    Symbol.for("SowController"),
  SowPaymentPlanController:         Symbol.for("SowPaymentPlanController"),
  SowPaymentPlanLineItemController: Symbol.for("SowPaymentPlanLineItemController"),
  InvoiceController:                Symbol.for("InvoiceController"),
  InvoiceLineItemController:        Symbol.for("InvoiceLineItemController"),
  PaymentController:                Symbol.for("PaymentController"),

  // ROUTES
  OrganizationRoutes:               Symbol.for("OrganizationRoutes"),
  CustomerRoutes:                   Symbol.for("CustomerRoutes"),
  SowRoutes:                        Symbol.for("SowRoutes"),
  SowPaymentPlanRoutes:             Symbol.for("SowPaymentPlanRoutes"),
  SowPaymentPlanLineItemRoutes:     Symbol.for("SowPaymentPlanLineItemRoutes"),
  InvoiceRoutes:                    Symbol.for("InvoiceRoutes"),
  InvoiceLineItemRoutes:            Symbol.for("InvoiceLineItemRoutes"),
  PaymentRoutes:                    Symbol.for("PaymentRoutes"),
};

export default TYPES;