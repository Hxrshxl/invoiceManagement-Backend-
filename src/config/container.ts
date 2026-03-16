import "reflect-metadata";
import { Container } from "inversify";
import TYPES from "../types/inversifyTypes";
import logger from "./logger";

import OrganizationService from "../services/organizationService";
import OrganizationController from "../controllers/organizationController";
import CustomerService from "../services/customerService";
import CustomerController from "../controllers/customerController";
import SowService from "../services/sowService";
import SowController from "../controllers/sowController";
import SowPaymentPlanService from "../services/sowPaymentPlanService";
import SowPaymentPlanController from "../controllers/sowPaymentPlanController";
import SowPaymentPlanLineItemService from "../services/sowPaymentPlanLineItemService";
import SowPaymentPlanLineItemController from "../controllers/sowPaymentPlanLineItemController";
import InvoiceService from "../services/invoiceService";
import InvoiceController from "../controllers/invoiceController";

const container = new Container();

container.bind(TYPES.Logger).toConstantValue(logger);

container.bind(TYPES.OrganizationService).to(OrganizationService).inSingletonScope();
container.bind(TYPES.OrganizationController).to(OrganizationController).inSingletonScope();

container.bind(TYPES.CustomerService).to(CustomerService).inSingletonScope();
container.bind(TYPES.CustomerController).to(CustomerController).inSingletonScope();

container.bind(TYPES.SowService).to(SowService).inSingletonScope();
container.bind(TYPES.SowController).to(SowController).inSingletonScope();

container.bind(TYPES.SowPaymentPlanService).to(SowPaymentPlanService).inSingletonScope();
container.bind(TYPES.SowPaymentPlanController).to(SowPaymentPlanController).inSingletonScope();

container.bind(TYPES.SowPaymentPlanLineItemService).to(SowPaymentPlanLineItemService).inSingletonScope();
container.bind(TYPES.SowPaymentPlanLineItemController).to(SowPaymentPlanLineItemController).inSingletonScope();

container.bind(TYPES.InvoiceService).to(InvoiceService).inSingletonScope();
container.bind(TYPES.InvoiceController).to(InvoiceController).inSingletonScope();

export default container;