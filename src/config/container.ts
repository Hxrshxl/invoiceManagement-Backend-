import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "../types/inversifyTypes";
import logger from "./logger";

// ─── DB SERVICES ──────────────────────────────────────────────────────────────
import {
  OrganizationDbService,
  CustomerDbService,
  SowDbService,
  SowPaymentPlanDbService,
  SowPaymentPlanLineItemDbService,
  InvoiceDbService,
  InvoiceLineItemDbService,
  PaymentDbService,
} from "../postgresDB/pgService";

// ─── SERVICES ─────────────────────────────────────────────────────────────────
import OrganizationService from "../services/organizationService";
import CustomerService from "../services/customerService";
import SowService from "../services/sowService";
import SowPaymentPlanService from "../services/sowPaymentPlanService";
import SowPaymentPlanLineItemService from "../services/sowPaymentPlanLineItemService";
import InvoiceService from "../services/invoiceService";
import InvoiceLineItemService from "../services/invoiceLineItemService";
import PaymentService from "../services/paymentService";

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────
import OrganizationController from "../controllers/organizationController";
import CustomerController from "../controllers/customerController";
import SowController from "../controllers/sowController";
import SowPaymentPlanController from "../controllers/sowPaymentPlanController";
import SowPaymentPlanLineItemController from "../controllers/sowPaymentPlanLineItemController";
import InvoiceController from "../controllers/invoiceController";
import InvoiceLineItemController from "../controllers/invoiceLineItemController";
import PaymentController from "../controllers/paymentController";

const container = new Container();

// ─── LOGGER ───────────────────────────────────────────────────────────────────
container.bind(TYPES.Logger).toConstantValue(logger);

// ─── DB SERVICES ──────────────────────────────────────────────────────────────
container.bind(TYPES.OrganizationDbService).to(OrganizationDbService).inSingletonScope();
container.bind(TYPES.CustomerDbService).to(CustomerDbService).inSingletonScope();
container.bind(TYPES.SowDbService).to(SowDbService).inSingletonScope();
container.bind(TYPES.SowPaymentPlanDbService).to(SowPaymentPlanDbService).inSingletonScope();
container.bind(TYPES.SowPaymentPlanLineItemDbService).to(SowPaymentPlanLineItemDbService).inSingletonScope();
container.bind(TYPES.InvoiceDbService).to(InvoiceDbService).inSingletonScope();
container.bind(TYPES.InvoiceLineItemDbService).to(InvoiceLineItemDbService).inSingletonScope();
container.bind(TYPES.PaymentDbService).to(PaymentDbService).inSingletonScope();

// ─── SERVICES ─────────────────────────────────────────────────────────────────
container.bind(TYPES.OrganizationService).to(OrganizationService).inSingletonScope();
container.bind(TYPES.CustomerService).to(CustomerService).inSingletonScope();
container.bind(TYPES.SowService).to(SowService).inSingletonScope();
container.bind(TYPES.SowPaymentPlanService).to(SowPaymentPlanService).inSingletonScope();
container.bind(TYPES.SowPaymentPlanLineItemService).to(SowPaymentPlanLineItemService).inSingletonScope();
container.bind(TYPES.InvoiceService).to(InvoiceService).inSingletonScope();
container.bind(TYPES.InvoiceLineItemService).to(InvoiceLineItemService).inSingletonScope();
container.bind(TYPES.PaymentService).to(PaymentService).inSingletonScope();

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────
container.bind(TYPES.OrganizationController).to(OrganizationController).inSingletonScope();
container.bind(TYPES.CustomerController).to(CustomerController).inSingletonScope();
container.bind(TYPES.SowController).to(SowController).inSingletonScope();
container.bind(TYPES.SowPaymentPlanController).to(SowPaymentPlanController).inSingletonScope();
container.bind(TYPES.SowPaymentPlanLineItemController).to(SowPaymentPlanLineItemController).inSingletonScope();
container.bind(TYPES.InvoiceController).to(InvoiceController).inSingletonScope();
container.bind(TYPES.InvoiceLineItemController).to(InvoiceLineItemController).inSingletonScope();
container.bind(TYPES.PaymentController).to(PaymentController).inSingletonScope();

export default container;