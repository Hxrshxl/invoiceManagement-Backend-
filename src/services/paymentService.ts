import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Payment from "../models/paymentModel";
import { CreatePaymentDto } from "../dto/createPaymentDto";
import { UpdatePaymentDto } from "../dto/updatePaymentDto";
import { IPaymentDbService, IInvoiceDbService } from "../postgresDB/pgInterface";
import { IPayment } from "../interfaces/paymentInterface";

@injectable()
class PaymentService {
  constructor(
    @inject(TYPES.PaymentDbService)
    private readonly paymentDbService: IPaymentDbService,

    @inject(TYPES.InvoiceDbService)
    private readonly invoiceDbService: IInvoiceDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

 async createPayment(dto: CreatePaymentDto): Promise<IPayment> {
  try {
    const invoice = await this.invoiceDbService.findInvoiceByUId(dto.invoiceUId); // ✅ findByUId
    if (!invoice) {
      throw { status: 404, message: "Invoice not found" };
    }
    if (invoice.status === "Drafted") {
      throw { status: 400, message: "Cannot record payment for a Drafted invoice — please approve it first" };
    }
    if (invoice.status === "Cancelled") {
      throw { status: 400, message: "Cannot record payment for a Cancelled invoice" };
    }

    const existingPayment = await this.paymentDbService.findPaymentByInvoiceId(invoice.id!); // ✅ resolved .id
    if (existingPayment) {
      throw { status: 409, message: "Payment already recorded for this invoice" };
    }

    const payment          = new Payment();
    payment.invoiceId      = invoice.id!;       // ✅ resolved .id
    payment.paymentDate    = dto.paymentDate;
    payment.forExAmount    = dto.forExAmount;
    payment.currency       = dto.currency;
    payment.indianAmount   = dto.indianAmount;
    payment.isFullPayment  = dto.isFullPayment;
    payment.bankPayment    = dto.bankPayment ?? "";
    payment.details        = dto.details     ?? "";
    payment.version        = 1;
    payment.archive        = false;

    const created = await this.paymentDbService.createPayment(payment);

    await this.invoiceDbService.updateInvoicePayment(
      invoice.id!,          
      created.id!,
      dto.paymentDate
    );
      this.logger.info(`Payment created with id: ${created.id}`);

      return {
        paymentUId:    created.paymentUId,
        paymentDate:   created.paymentDate,
        indianAmount:  created.indianAmount,
        isFullPayment: created.isFullPayment,
        bankPayment:   created.bankPayment,
        details:       created.details,
      } as any;
    } catch (error: any) {
      this.logger.error("Error creating payment", error);
      throw error.status ? error : { status: 500, message: "Failed to create payment" };
    }
  }

async getPaymentByInvoiceId(invoiceUId: string): Promise<IPayment> {
  try {
    const invoice = await this.invoiceDbService.findInvoiceByUId(invoiceUId);  // ✅ findByUId
    if (!invoice) {
      throw { status: 404, message: "Invoice not found" };
    }

    const payment = await this.paymentDbService.findPaymentByInvoiceId(invoice.id!);  // ✅ resolved id
    if (!payment) {
      throw { status: 404, message: "No payment found for this invoice" };
    }

      this.logger.info(`Fetched payment for invoiceId: ${invoiceUId}`);

      return {
        paymentUId:    payment.paymentUId,
        paymentDate:   payment.paymentDate,
        indianAmount:  payment.indianAmount,
        isFullPayment: payment.isFullPayment,
        bankPayment:   payment.bankPayment,
        details:       payment.details,
      } as any;
    } catch (error: any) {
      this.logger.error(`Error fetching payment for invoiceId: ${invoiceUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch payment" };
    }
  }

  // async updatePayment(dto: UpdatePaymentDto): Promise<IPayment> {
  //   try {
  //     const existing = await this.paymentDbService.findPaymentByUId(dto.paymentUId);
  //     if (!existing) {
  //       throw { status: 404, message: "Payment not found" };
  //     }

  //     await this.paymentDbService.archivePayment(existing.id!);

  //     const updated          = new Payment();
  //     updated.paymentUId     = existing.paymentUId;
  //     updated.version        = existing.version + 1;
  //     updated.archive        = false;
  //     updated.invoiceId      = existing.invoiceId;
  //     updated.paymentDate    = dto.paymentDate   ?? existing.paymentDate;
  //     updated.forExAmount    = dto.forExAmount   ?? existing.forExAmount;
  //     updated.currency       = dto.currency      ?? existing.currency;
  //     updated.indianAmount   = dto.indianAmount  ?? existing.indianAmount;
  //     updated.isFullPayment  = dto.isFullPayment ?? existing.isFullPayment;
  //     updated.bankPayment    = dto.bankPayment   ?? existing.bankPayment;
  //     updated.details        = dto.details       ?? existing.details;

  //     const created = await this.paymentDbService.createPayment(updated);
  //     this.logger.info(`Payment updated with UId: ${dto.paymentUId} version: ${created.version}`);

  //     return {
  //       id:            created.id,
  //       paymentUId:    created.paymentUId,
  //       invoiceId:     created.invoiceId,
  //       paymentDate:   created.paymentDate,
  //       forExAmount:   created.forExAmount,
  //       currency:      created.currency,
  //       indianAmount:  created.indianAmount,
  //       isFullPayment: created.isFullPayment,
  //       bankPayment:   created.bankPayment,
  //       details:       created.details,
  //     } as any;
  //   } catch (error: any) {
  //     this.logger.error("Error updating payment", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update payment" };
  //   }
  // }

  // async deletePayment(paymentUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.paymentDbService.findPaymentByUId(paymentUId);
  //     if (!existing) {
  //       throw { status: 404, message: "Payment not found" };
  //     }
  //     await this.paymentDbService.archivePayment(existing.id!);
  //     this.logger.info(`Payment deleted with UId: ${paymentUId}`);
  //     return { message: "Payment deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting payment", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete payment" };
  //   }
  // }
}

export default PaymentService;
