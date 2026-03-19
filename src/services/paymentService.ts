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

  private mapToInterface(payment: Payment): IPayment {
    return {
      id:            payment.id,
      paymentUId:    payment.paymentUId,
      version:       payment.version,
      archive:       payment.archive,
      invoiceId:     payment.invoiceId,
      paymentDate:   payment.paymentDate,
      forExAmount:   payment.forExAmount,
      currency:      payment.currency,
      indianAmount:  payment.indianAmount,
      isFullPayment: payment.isFullPayment,
      bankPayment:   payment.bankPayment,
      details:       payment.details,
      createdAt:     payment.createdAt,
      updatedAt:     payment.updatedAt,
    };
  }

  async createPayment(dto: CreatePaymentDto): Promise<IPayment> {
    try {
      const invoice = await this.invoiceDbService.findInvoiceById(dto.invoiceId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }
      if (invoice.status === "Drafted") {
        throw { status: 400, message: "Cannot record payment for a Drafted invoice — please approve it first" };
      }
      if (invoice.status === "Cancelled") {
        throw { status: 400, message: "Cannot record payment for a Cancelled invoice" };
      }

      const existingPayment = await this.paymentDbService.findPaymentByInvoiceId(dto.invoiceId);
      if (existingPayment) {
        throw { status: 409, message: "Payment already recorded for this invoice" };
      }

      const payment = new Payment();
      payment.invoiceId     = dto.invoiceId;
      payment.paymentDate   = dto.paymentDate;
      payment.forExAmount   = dto.forExAmount;
      payment.currency      = dto.currency;
      payment.indianAmount  = dto.indianAmount;
      payment.isFullPayment = dto.isFullPayment;
      payment.bankPayment   = dto.bankPayment ?? "";
      payment.details       = dto.details     ?? "";
      payment.version       = 1;
      payment.archive       = false;

      const created = await this.paymentDbService.createPayment(payment);

      await this.invoiceDbService.updateInvoicePayment(
        dto.invoiceId,
        created.id!,
        dto.paymentDate
      );

      this.logger.info(`Payment created with id: ${created.id}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating payment", error);
      throw error.status ? error : { status: 500, message: "Failed to create payment" };
    }
  }

  async getPaymentByInvoiceId(invoiceId: string): Promise<IPayment> {
    try {
      const invoice = await this.invoiceDbService.findInvoiceById(invoiceId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      const payment = await this.paymentDbService.findPaymentByInvoiceId(invoiceId);
      if (!payment) {
        throw { status: 404, message: "No payment found for this invoice" };
      }

      this.logger.info(`Fetched payment for invoiceId: ${invoiceId}`);
      return this.mapToInterface(payment);
    } catch (error: any) {
      this.logger.error(`Error fetching payment for invoiceId: ${invoiceId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch payment" };
    }
  }
}

export default PaymentService;