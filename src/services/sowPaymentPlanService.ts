import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import Sow from "../models/sowModel";
import Customer from "../models/customerModel";
import { ISowPaymentPlan } from "../interfaces/sowPaymentPlanInterface";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";
import { ISowPaymentPlanDbService, ISowDbService, ICustomerDbService } from "../postgresDB/pgInterface";

@injectable()
class SowPaymentPlanService {
  constructor(
    @inject(TYPES.SowPaymentPlanDbService)
    private readonly sowPaymentPlanDbService: ISowPaymentPlanDbService,

    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.CustomerDbService)
    private readonly customerDbService: ICustomerDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowPaymentPlan(dto: CreateSowPaymentPlanDto): Promise<ISowPaymentPlan> {
    try {
      const sow = await this.sowDbService.findSowByUId(dto.sowUId);
      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }

      const customer = await this.customerDbService.findCustomerByUId(dto.customerUId);
      if (!customer) {
        throw { status: 404, message: "Customer not found" };
      }

      const totalAlreadyPlanned = await this.sowPaymentPlanDbService.getTotalPlannedAmountBySowId(sow.id);
      const newTotal            = totalAlreadyPlanned + dto.totalActualAmount;

      if (newTotal > sow.totalValue) {
        throw {
          status: 400,
          message: `Total planned amount ($${newTotal}) exceeds SOW total value ($${sow.totalValue}). Remaining: $${sow.totalValue - totalAlreadyPlanned}`,
        };
      }

      const plan              = new SowPaymentPlan();
      plan.sowId              = sow.id;
      plan.customerId         = customer.id;
      plan.plannedInvoiceDate = dto.plannedInvoiceDate;
      plan.totalActualAmount  = dto.totalActualAmount;
      plan.version            = 1;
      plan.archive            = false;

      const created = await this.sowPaymentPlanDbService.createSowPaymentPlan(plan);
      this.logger.info(`SOW Payment Plan created with id: ${created.id}`);

      return {
        sowPaymentPlanUId:       created.sowPaymentPlanUId,
        sowId:                   created.sowId,
        customerId:              created.customerId,
        plannedInvoiceDate:      created.plannedInvoiceDate,
        totalActualAmount:       created.totalActualAmount,
        SowPaymentPlanLineItems: [],
        Invoices:                [],
      } as any;
    } catch (error: any) {
      this.logger.error("Error creating SOW Payment Plan", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW Payment Plan" };
    }
  }

  async getAllSowPaymentPlans(): Promise<ISowPaymentPlan[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findAllSowPaymentPlans();
      this.logger.info(`Fetched ${plans.length} SOW Payment Plans`);

      return plans.map((plan) => {
        const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
        const invoices  = ((plan as any).Invoices as Invoice[])                               ?? [];
        const customer  = (plan as any).Customer as Customer | null;
        const sow       = (plan as any).Sow as Sow | null;

        return {
          sowPaymentPlanUId:  plan.sowPaymentPlanUId,
          plannedInvoiceDate: plan.plannedInvoiceDate,
          totalActualAmount:  plan.totalActualAmount,
          customerName:       customer?.legalName ?? null,
          sowTitle:           sow?.title          ?? null,
          SowPaymentPlanLineItems: lineItems.map((li) => ({
            particular: li.particular,
            rate:       li.rate,
            unit:       li.unit,
            total:      li.total,
          })),
          Invoices: invoices.map((invoice) => ({
            status:            invoice.status,
            totalInvoiceValue: invoice.totalInvoiceValue,
            invoiceAmount:     invoice.invoiceAmount,
            paymentReceivedOn: invoice.paymentReceivedOn,
          })),
        } as any;
      });
    } catch (error: any) {
      this.logger.error("Error fetching SOW Payment Plans", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plans" };
    }
  }

  async getSowPaymentPlanById(sowPaymentPlanUId: string): Promise<ISowPaymentPlan> {
    try {
      const plan = await this.sowPaymentPlanDbService.findSowPaymentPlanByUId(sowPaymentPlanUId);
      if (!plan) {
        throw { status: 404, message: "SOW Payment Plan not found" };
      }
      this.logger.info(`Fetched SOW Payment Plan with UId: ${sowPaymentPlanUId}`);

      const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
      const invoices  = ((plan as any).Invoices as Invoice[])                               ?? [];
      const customer  = (plan as any).Customer as Customer | null;
      const sow       = (plan as any).Sow as Sow | null;

      return {
        sowPaymentPlanUId:  plan.sowPaymentPlanUId,
        plannedInvoiceDate: plan.plannedInvoiceDate,
        totalActualAmount:  plan.totalActualAmount,
        customerName:       customer?.legalName ?? null,
        sowTitle:           sow?.title          ?? null,
        SowPaymentPlanLineItems: lineItems.map((li) => ({
          orderId:    li.orderId,
          particular: li.particular,
          rate:       li.rate,
          unit:       li.unit,
          total:      li.total,
        })),
        Invoices: invoices.map((invoice) => ({
          invoiceUId:        invoice.invoiceUId,
          status:            invoice.status,
          totalInvoiceValue: invoice.totalInvoiceValue,
          invoiceAmount:     invoice.invoiceAmount,
          paymentReceivedOn: invoice.paymentReceivedOn,
        })),
      } as any;
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plan with UId: ${sowPaymentPlanUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plan" };
    }
  }

  async getSowPaymentPlansBySowId(sowUId: string): Promise<ISowPaymentPlan[]> {
    try {
      const sow = await this.sowDbService.findSowByUId(sowUId);
      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }

      const plans = await this.sowPaymentPlanDbService.findSowPaymentPlansBySowId(sow.id);
      if (!plans.length) {
        throw { status: 404, message: "No SOW Payment Plans found for this SOW" };
      }
      this.logger.info(`Fetched ${plans.length} SOW Payment Plans for sowUId: ${sowUId}`);

      return plans.map((plan) => {
        const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
        const invoices  = ((plan as any).Invoices as Invoice[])                               ?? [];

        return {
          sowPaymentPlanUId:  plan.sowPaymentPlanUId,
          plannedInvoiceDate: plan.plannedInvoiceDate,
          totalActualAmount:  plan.totalActualAmount,
          SowPaymentPlanLineItems: lineItems.map((li) => ({
            orderId:    li.orderId,
            particular: li.particular,
            rate:       li.rate,
            unit:       li.unit,
            total:      li.total,
          })),
          Invoices: invoices.map((invoice) => ({
            invoiceUId:        invoice.invoiceUId,
            status:            invoice.status,
            totalInvoiceValue: invoice.totalInvoiceValue,
            invoiceAmount:     invoice.invoiceAmount,
            paymentReceivedOn: invoice.paymentReceivedOn,
          })),
        } as any;
      });
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plans for sowUId: ${sowUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plans" };
    }
  }

  async getInvoiceSchedule(): Promise<any[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findSowPaymentPlansWithInvoices();
      this.logger.info(`Fetched invoice schedule for ${plans.length} payment plans`);

      return plans.map((plan) => {
        const invoices = (plan as any).Invoices as any[];
        const invoice  = invoices && invoices.length > 0 ? invoices[0] : null;
        return {
          plannedInvoiceDate: plan.plannedInvoiceDate,
          totalActualAmount:  plan.totalActualAmount,
          invoiceGenerated:   invoice ? true : false,
          invoiceStatus:      invoice ? invoice.status     : null,
        };
      });
    } catch (error: any) {
      this.logger.error("Error fetching invoice schedule", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice schedule" };
    }
  }
}

export default SowPaymentPlanService;