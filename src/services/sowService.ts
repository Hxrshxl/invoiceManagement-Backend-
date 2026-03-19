import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import Payment from "../models/paymentModel";
import { CreateSowDto } from "../dto/createSowDto";
import { UpdateSowDto } from "../dto/updateSowDto";
import { ISowDbService } from "../postgresDB/pgInterface";
import { ISow } from "../interfaces/sowInterface";

@injectable()
class SowService {
  constructor(
    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  // ─── MAP PAYMENT ────────────────────────────────────────────────────────────

  // private mapPayment(payment: Payment | null | undefined) {
  //   if (!payment) return null;
  //   return {
  //     id:            payment.id,
  //     paymentUId:    payment.paymentUId,
  //     version:       payment.version,
  //     archive:       payment.archive,
  //     invoiceId:     payment.invoiceId,
  //     paymentDate:   payment.paymentDate,
  //     forExAmount:   payment.forExAmount,
  //     currency:      payment.currency,
  //     indianAmount:  payment.indianAmount,
  //     isFullPayment: payment.isFullPayment,
  //     bankPayment:   payment.bankPayment,
  //     details:       payment.details,
  //     createdAt:     payment.createdAt,
  //     updatedAt:     payment.updatedAt,
  //   };
  // }

  // ─── MAP INVOICE LINE ITEM ───────────────────────────────────────────────────

  // private mapInvoiceLineItem(lineItem: InvoiceLineItem) {
  //   return {
  //     id:                 lineItem.id,
  //     invoiceLineItemUId: lineItem.invoiceLineItemUId,
  //     version:            lineItem.version,
  //     archive:            lineItem.archive,
  //     invoiceId:          lineItem.invoiceId,
  //     orderNo:            lineItem.orderNo,
  //     particular:         lineItem.particular,
  //     rate:               lineItem.rate,
  //     unit:               lineItem.unit,
  //     total:              lineItem.total,
  //     createdAt:          lineItem.createdAt,
  //     updatedAt:          lineItem.updatedAt,
  //   };
  // }

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

  private mapSowPaymentPlan(plan: SowPaymentPlan) {
    const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
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
    };
  }

  // ─── MAP SOW ─────────────────────────────────────────────────────────────────

  private mapToInterface(sow: Sow): ISow {
    const plans   = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
    const invoices = ((sow as any).Invoices as Invoice[]) ?? [];
    return {
      id:                    sow.id,
      sowUId:                sow.sowUId,
      version:               sow.version,
      archive:               sow.archive,
      customerId:            sow.customerId,
      title:                 sow.title,
      totalValue:            sow.totalValue,
      currency:              sow.currency,
      validFrom:             sow.validFrom,
      validUpto:             sow.validUpto,
      customerPONumber:      sow.customerPONumber,
      customerSONumber:      sow.customerSONumber,
      invoiceEmailAddresses: sow.invoiceEmailAddresses,
      createdAt:             sow.createdAt,
      updatedAt:             sow.updatedAt,
      SowPaymentPlans:       plans.map((p) => this.mapSowPaymentPlan(p)),
      Invoices:              invoices.map((i) => this.mapInvoice(i)),
    } as any;
  }

  // ─── CREATE SOW ──────────────────────────────────────────────────────────────

  async createSow(dto: CreateSowDto): Promise<ISow> {
    try {
      const existing = await this.sowDbService.findSowByPONumber(dto.customerPONumber);
      if (existing) {
        throw { status: 409, message: "SOW with this PO number already exists" };
      }

      const sow = new Sow();
      sow.customerId            = dto.customerId;
      sow.title                 = dto.title;
      sow.totalValue            = dto.totalValue;
      sow.currency              = dto.currency;
      sow.validFrom             = dto.validFrom;
      sow.validUpto             = dto.validUpto;
      sow.customerPONumber      = dto.customerPONumber;
      sow.customerSONumber      = dto.customerSONumber;
      sow.invoiceEmailAddresses = dto.invoiceEmailAddresses;
      sow.version               = 1;
      sow.archive               = false;

      const created = await this.sowDbService.createSow(sow);
      this.logger.info(`SOW created with id: ${created.id}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating SOW", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW" };
    }
  }

  // ─── GET ALL SOWS ────────────────────────────────────────────────────────────

  async getAllSows(): Promise<ISow[]> {
    try {
      const sows = await this.sowDbService.findAllSows();
      this.logger.info(`Fetched ${sows.length} SOWs`);
      return sows.map((s) => this.mapToInterface(s));
    } catch (error: any) {
      this.logger.error("Error fetching SOWs", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOWs" };
    }
  }

  // ─── GET SOW BY ID ───────────────────────────────────────────────────────────

  async getSowById(sowUId: string): Promise<ISow> {
    try {
      const sow = await this.sowDbService.findSowByUId(sowUId);
      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }
      this.logger.info(`Fetched SOW with UId: ${sowUId}`);
      return this.mapToInterface(sow);
    } catch (error: any) {
      this.logger.error(`Error fetching SOW with UId: ${sowUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW" };
    }
  }

  // ─── UPDATE SOW ──────────────────────────────────────────────────────────────

  // async updateSow(dto: UpdateSowDto): Promise<ISow> {
  //   try {
  //     const existing = await this.sowDbService.findSowByUId(dto.sowUId);
  //     if (!existing) {
  //       throw { status: 404, message: "SOW not found" };
  //     }

  //     await this.sowDbService.archiveSow(existing.id!);

  //     const updated = new Sow();
  //     updated.sowUId                = existing.sowUId;
  //     updated.version               = existing.version + 1;
  //     updated.archive               = false;
  //     updated.customerId            = existing.customerId;
  //     updated.title                 = dto.title                 ?? existing.title;
  //     updated.totalValue            = dto.totalValue            ?? existing.totalValue;
  //     updated.currency              = dto.currency              ?? existing.currency;
  //     updated.validFrom             = dto.validFrom             ?? existing.validFrom;
  //     updated.validUpto             = dto.validUpto             ?? existing.validUpto;
  //     updated.customerPONumber      = dto.customerPONumber      ?? existing.customerPONumber;
  //     updated.customerSONumber      = dto.customerSONumber      ?? existing.customerSONumber;
  //     updated.invoiceEmailAddresses = dto.invoiceEmailAddresses ?? existing.invoiceEmailAddresses;

  //     const created = await this.sowDbService.createSow(updated);
  //     this.logger.info(`SOW updated with UId: ${dto.sowUId} version: ${created.version}`);
  //     return this.mapToInterface(created);
  //   } catch (error: any) {
  //     this.logger.error("Error updating SOW", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update SOW" };
  //   }
  // }

  // // ─── DELETE SOW ──────────────────────────────────────────────────────────────

  // async deleteSow(sowUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.sowDbService.findSowByUId(sowUId);
  //     if (!existing) {
  //       throw { status: 404, message: "SOW not found" };
  //     }
  //     await this.sowDbService.archiveSow(existing.id!);
  //     this.logger.info(`SOW deleted with UId: ${sowUId}`);
  //     return { message: "SOW deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting SOW", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete SOW" };
  //   }
  // }
}

export default SowService;