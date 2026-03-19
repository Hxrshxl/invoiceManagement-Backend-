import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import Payment from "../models/paymentModel";
import { ISowPaymentPlan } from "../interfaces/sowPaymentPlanInterface";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";
import { UpdateSowPaymentPlanDto } from "../dto/updateSowPaymentPlanDto";
import { ISowPaymentPlanDbService, ISowDbService } from "../postgresDB/pgInterface";

@injectable()
class SowPaymentPlanService {
  constructor(
    @inject(TYPES.SowPaymentPlanDbService)
    private readonly sowPaymentPlanDbService: ISowPaymentPlanDbService,

    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  // ─── MAP PAYMENT ─────────────────────────────────────────────────────────────



  // ─── MAP INVOICE ─────────────────────────────────────────────────────────────

  private mapInvoice(invoice: Invoice) {
    const lineItems = ((invoice as any).InvoiceLineItems as InvoiceLineItem[]) ?? [];
    const payment   = (invoice as any).Payment as Payment | null;
    return {
      id:                invoice.id,
      invoiceUId:        invoice.invoiceUId,
      version:           invoice.version,
      archive:           invoice.archive,
      sowId:             invoice.sowId,
      sowPaymentPlanId:  invoice.sowPaymentPlanId,
      customerId:        invoice.customerId,
      status:            invoice.status,
      totalInvoiceValue: invoice.totalInvoiceValue,
      invoiceAmount:     invoice.invoiceAmount,
      invoiceTaxAmount:  invoice.invoiceTaxAmount,
      invoiceSentOn:     invoice.invoiceSentOn,
      paymentReceivedOn: invoice.paymentReceivedOn,
      invoiceVersionNo:  invoice.invoiceVersionNo,
      paymentId:         invoice.paymentId,
      createdAt:         invoice.createdAt,
      updatedAt:         invoice.updatedAt
    };
  }

  // ─── MAP SOW PAYMENT PLAN LINE ITEM ─────────────────────────────────────────

  private mapSowPaymentPlanLineItem(lineItem: SowPaymentPlanLineItem) {
    return {
      id:                        lineItem.id,
      sowPaymentPlanLineItemUId: lineItem.sowPaymentPlanLineItemUId,
      version:                   lineItem.version,
      archive:                   lineItem.archive,
      sowPaymentPlanId:          lineItem.sowPaymentPlanId,
      sowId:                     lineItem.sowId,
      orderId:                   lineItem.orderId,
      particular:                lineItem.particular,
      rate:                      lineItem.rate,
      unit:                      lineItem.unit,
      total:                     lineItem.total,
      createdAt:                 lineItem.createdAt,
      updatedAt:                 lineItem.updatedAt,
    };
  }

  // ─── MAP SOW PAYMENT PLAN ────────────────────────────────────────────────────

  private mapToInterface(plan: SowPaymentPlan): ISowPaymentPlan {
    const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
    const invoices  = ((plan as any).Invoices as Invoice[]) ?? [];
    return {
      id:                 plan.id,
      sowPaymentPlanUId:  plan.sowPaymentPlanUId,
      version:            plan.version,
      archive:            plan.archive,
      sowId:              plan.sowId,
      customerId:         plan.customerId,
      plannedInvoiceDate: plan.plannedInvoiceDate,
      totalActualAmount:  plan.totalActualAmount,
      createdAt:          plan.createdAt,
      updatedAt:          plan.updatedAt,
      SowPaymentPlanLineItems: lineItems.map((l) => this.mapSowPaymentPlanLineItem(l)),
      Invoices:                invoices.map((i) => this.mapInvoice(i)),
    } as any;
  }

  // ─── CREATE SOW PAYMENT PLAN ─────────────────────────────────────────────────

  async createSowPaymentPlan(dto: CreateSowPaymentPlanDto): Promise<ISowPaymentPlan> {
    try {
      const sow = await this.sowDbService.findSowById(dto.sowId);
      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }

      const totalAlreadyPlanned = await this.sowPaymentPlanDbService.getTotalPlannedAmountBySowId(dto.sowId);
      const newTotal            = totalAlreadyPlanned + dto.totalActualAmount;

      if (newTotal > sow.totalValue) {
        throw {
          status: 400,
          message: `Total planned amount ($${newTotal}) exceeds SOW total value ($${sow.totalValue}). Remaining: $${sow.totalValue - totalAlreadyPlanned}`,
        };
      }

      const plan = new SowPaymentPlan();
      plan.sowId              = dto.sowId;
      plan.customerId         = dto.customerId;
      plan.plannedInvoiceDate = dto.plannedInvoiceDate;
      plan.totalActualAmount  = dto.totalActualAmount;
      plan.version            = 1;
      plan.archive            = false;

      const created = await this.sowPaymentPlanDbService.createSowPaymentPlan(plan);
      this.logger.info(`SOW Payment Plan created with id: ${created.id}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating SOW Payment Plan", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW Payment Plan" };
    }
  }

  // ─── GET ALL SOW PAYMENT PLANS ───────────────────────────────────────────────

  async getAllSowPaymentPlans(): Promise<ISowPaymentPlan[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findAllSowPaymentPlans();
      this.logger.info(`Fetched ${plans.length} SOW Payment Plans`);
      return plans.map((p) => this.mapToInterface(p));
    } catch (error: any) {
      this.logger.error("Error fetching SOW Payment Plans", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plans" };
    }
  }

  // ─── GET SOW PAYMENT PLAN BY ID ──────────────────────────────────────────────

  async getSowPaymentPlanById(sowPaymentPlanUId: string): Promise<ISowPaymentPlan> {
    try {
      const plan = await this.sowPaymentPlanDbService.findSowPaymentPlanByUId(sowPaymentPlanUId);
      if (!plan) {
        throw { status: 404, message: "SOW Payment Plan not found" };
      }
      this.logger.info(`Fetched SOW Payment Plan with UId: ${sowPaymentPlanUId}`);
      return this.mapToInterface(plan);
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plan with UId: ${sowPaymentPlanUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plan" };
    }
  }

  // ─── GET SOW PAYMENT PLANS BY SOW ID ─────────────────────────────────────────

  async getSowPaymentPlansBySowId(sowId: string): Promise<ISowPaymentPlan[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findSowPaymentPlansBySowId(sowId);
      if (!plans.length) {
        throw { status: 404, message: "No SOW Payment Plans found for this SOW" };
      }
      this.logger.info(`Fetched ${plans.length} SOW Payment Plans for sowId: ${sowId}`);
      return plans.map((p) => this.mapToInterface(p));
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plans for sowId: ${sowId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plans" };
    }
  }

  // ─── UPDATE SOW PAYMENT PLAN ─────────────────────────────────────────────────

  // async updateSowPaymentPlan(dto: UpdateSowPaymentPlanDto): Promise<ISowPaymentPlan> {
  //   try {
  //     const existing = await this.sowPaymentPlanDbService.findSowPaymentPlanByUId(dto.sowPaymentPlanUId);
  //     if (!existing) {
  //       throw { status: 404, message: "SOW Payment Plan not found" };
  //     }

  //     if (dto.totalActualAmount) {
  //       const sow = await this.sowDbService.findSowById(existing.sowId);
  //       if (!sow) {
  //         throw { status: 404, message: "SOW not found" };
  //       }
  //       const totalExcludingCurrent = (await this.sowPaymentPlanDbService.getTotalPlannedAmountBySowId(existing.sowId)) - existing.totalActualAmount;
  //       const newTotal              = totalExcludingCurrent + dto.totalActualAmount;
  //       if (newTotal > sow.totalValue) {
  //         throw {
  //           status: 400,
  //           message: `Total planned amount ($${newTotal}) exceeds SOW total value ($${sow.totalValue})`,
  //         };
  //       }
  //     }

  //     await this.sowPaymentPlanDbService.archiveSowPaymentPlan(existing.id!);

  //     const updated = new SowPaymentPlan();
  //     updated.sowPaymentPlanUId  = existing.sowPaymentPlanUId;
  //     updated.version            = existing.version + 1;
  //     updated.archive            = false;
  //     updated.sowId              = existing.sowId;
  //     updated.customerId         = existing.customerId;
  //     updated.plannedInvoiceDate = dto.plannedInvoiceDate ?? existing.plannedInvoiceDate;
  //     updated.totalActualAmount  = dto.totalActualAmount  ?? existing.totalActualAmount;

  //     const created = await this.sowPaymentPlanDbService.createSowPaymentPlan(updated);
  //     this.logger.info(`SOW Payment Plan updated with UId: ${dto.sowPaymentPlanUId} version: ${created.version}`);
  //     return this.mapToInterface(created);
  //   } catch (error: any) {
  //     this.logger.error("Error updating SOW Payment Plan", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update SOW Payment Plan" };
  //   }
  // }

  // // ─── DELETE SOW PAYMENT PLAN ─────────────────────────────────────────────────

  // async deleteSowPaymentPlan(sowPaymentPlanUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.sowPaymentPlanDbService.findSowPaymentPlanByUId(sowPaymentPlanUId);
  //     if (!existing) {
  //       throw { status: 404, message: "SOW Payment Plan not found" };
  //     }
  //     await this.sowPaymentPlanDbService.archiveSowPaymentPlan(existing.id!);
  //     this.logger.info(`SOW Payment Plan deleted with UId: ${sowPaymentPlanUId}`);
  //     return { message: "SOW Payment Plan deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting SOW Payment Plan", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete SOW Payment Plan" };
  //   }
  // }

  // ─── GET INVOICE SCHEDULE ────────────────────────────────────────────────────

  async getInvoiceSchedule(): Promise<any[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findSowPaymentPlansWithInvoices();
      this.logger.info(`Fetched invoice schedule for ${plans.length} payment plans`);
      return plans.map((plan) => {
        const invoices = (plan as any).Invoices as any[];
        const invoice  = invoices && invoices.length > 0 ? invoices[0] : null;
        return {
          planId:             plan.id,
          sowPaymentPlanUId:  plan.sowPaymentPlanUId,
          sowId:              plan.sowId,
          customerId:         plan.customerId,
          plannedInvoiceDate: plan.plannedInvoiceDate,
          totalActualAmount:  plan.totalActualAmount,
          invoiceGenerated:   invoice ? true : false,
          invoiceId:          invoice ? invoice.id : null,
          invoiceStatus:      invoice ? invoice.status : null,
        };
      });
    } catch (error: any) {
      this.logger.error("Error fetching invoice schedule", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice schedule" };
    }
  }
}

export default SowPaymentPlanService;