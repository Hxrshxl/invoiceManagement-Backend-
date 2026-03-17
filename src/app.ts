import "reflect-metadata";
import express, { Application, Request, Response, NextFunction } from "express";
import { Container } from "inversify";
import logger from "./config/logger";
import envConfig from "./config/envConfig";
import sequelize from "./postgresDB/pgConfig";
import TYPES from "./types/inversifyTypes";

// ─── Models ───────────────────────────────────────────────────────────────────
import "./models/index";

// ─── Routes ───────────────────────────────────────────────────────────────────
import organizationRouter from "./routes/organizationRoutes";
import customerRouter from "./routes/customerRoutes";
import sowRouter from "./routes/sowRoutes";
import sowPaymentPlanRouter from "./routes/sowPaymentPlanRoutes";
import sowPaymentPlanLineItemRouter from "./routes/sowPaymentPlanLineItemRoutes";
import invoiceRouter from "./routes/invoiceRoutes";
import invoiceLineItemRouter from "./routes/invoiceLineItemRoutes";
import paymentRouter from "./routes/paymentRoutes";

// ─── DB Services ──────────────────────────────────────────────────────────────
import {
  OrganizationDbService,
  CustomerDbService,
  SowDbService,
  SowPaymentPlanDbService,
  SowPaymentPlanLineItemDbService,
  InvoiceDbService,
  InvoiceLineItemDbService,
  PaymentDbService,
} from "./postgresDB/pgService";

// ─── DB Service Interfaces ────────────────────────────────────────────────────
import {
  IOrganizationDbService,
  ICustomerDbService,
  ISowDbService,
  ISowPaymentPlanDbService,
  ISowPaymentPlanLineItemDbService,
  IInvoiceDbService,
  IInvoiceLineItemDbService,
  IPaymentDbService,
} from "./postgresDB/pgInterface";

// ─── Services ─────────────────────────────────────────────────────────────────
import OrganizationService from "./services/organizationService";
import CustomerService from "./services/customerService";
import SowService from "./services/sowService";
import SowPaymentPlanService from "./services/sowPaymentPlanService";
import SowPaymentPlanLineItemService from "./services/sowPaymentPlanLineItemService";
import InvoiceService from "./services/invoiceService";
import InvoiceLineItemService from "./services/invoiceLineItemService";
import PaymentService from "./services/paymentService";

// ─── Controllers ──────────────────────────────────────────────────────────────
import OrganizationController from "./controllers/organizationController";
import CustomerController from "./controllers/customerController";
import SowController from "./controllers/sowController";
import SowPaymentPlanController from "./controllers/sowPaymentPlanController";
import SowPaymentPlanLineItemController from "./controllers/sowPaymentPlanLineItemController";
import InvoiceController from "./controllers/invoiceController";
import InvoiceLineItemController from "./controllers/invoiceLineItemController";
import PaymentController from "./controllers/paymentController";

// ─── 1. Create Express App ────────────────────────────────────────────────────
const app: Application = express();

// ─── 2. Create DI Container ───────────────────────────────────────────────────
const container = new Container();

// ─── 3. Bind Logger ───────────────────────────────────────────────────────────
container.bind(TYPES.Logger).toConstantValue(logger);

// ─── 4. Bind DB Services ──────────────────────────────────────────────────────
container.bind<IOrganizationDbService>(TYPES.OrganizationDbService).to(OrganizationDbService);
container.bind<ICustomerDbService>(TYPES.CustomerDbService).to(CustomerDbService);
container.bind<ISowDbService>(TYPES.SowDbService).to(SowDbService);
container.bind<ISowPaymentPlanDbService>(TYPES.SowPaymentPlanDbService).to(SowPaymentPlanDbService);
container.bind<ISowPaymentPlanLineItemDbService>(TYPES.SowPaymentPlanLineItemDbService).to(SowPaymentPlanLineItemDbService);
container.bind<IInvoiceDbService>(TYPES.InvoiceDbService).to(InvoiceDbService);
container.bind<IInvoiceLineItemDbService>(TYPES.InvoiceLineItemDbService).to(InvoiceLineItemDbService);
container.bind<IPaymentDbService>(TYPES.PaymentDbService).to(PaymentDbService);

// ─── 5. Bind Services ─────────────────────────────────────────────────────────
container.bind(TYPES.OrganizationService).to(OrganizationService);
container.bind(TYPES.CustomerService).to(CustomerService);
container.bind(TYPES.SowService).to(SowService);
container.bind(TYPES.SowPaymentPlanService).to(SowPaymentPlanService);
container.bind(TYPES.SowPaymentPlanLineItemService).to(SowPaymentPlanLineItemService);
container.bind(TYPES.InvoiceService).to(InvoiceService);
container.bind(TYPES.InvoiceLineItemService).to(InvoiceLineItemService);
container.bind(TYPES.PaymentService).to(PaymentService);

// ─── 6. Bind Controllers ──────────────────────────────────────────────────────
container.bind(TYPES.OrganizationController).to(OrganizationController);
container.bind(TYPES.CustomerController).to(CustomerController);
container.bind(TYPES.SowController).to(SowController);
container.bind(TYPES.SowPaymentPlanController).to(SowPaymentPlanController);
container.bind(TYPES.SowPaymentPlanLineItemController).to(SowPaymentPlanLineItemController);
container.bind(TYPES.InvoiceController).to(InvoiceController);
container.bind(TYPES.InvoiceLineItemController).to(InvoiceLineItemController);
container.bind(TYPES.PaymentController).to(PaymentController);

// ─── 7. Export Container ──────────────────────────────────────────────────────
export { container };

// ─── 8. Middlewares ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/organizations",           organizationRouter);
app.use("/api/customers",               customerRouter);
app.use("/api/sows",                    sowRouter);
app.use("/api/sowPaymentPlans",         sowPaymentPlanRouter);
app.use("/api/sowPaymentPlanLineItems", sowPaymentPlanLineItemRouter);
app.use("/api/invoices",                invoiceRouter);
app.use("/api/invoiceLineItems",        invoiceLineItemRouter);
app.use("/api/payments",               paymentRouter);

const startServer = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    await sequelize.sync({ alter: true });
    logger.info("Database synced successfully");

    app.listen(envConfig.port, () => {
      logger.info(`Server running on port ${envConfig.port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();