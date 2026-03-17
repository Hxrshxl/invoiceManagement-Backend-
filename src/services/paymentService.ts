import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Payment from "../models/paymentModel";
import { CreatePaymentDto } from "../dto/createPaymentDto";
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
      // Check invoice exists
      const invoice = await this.invoiceDbService.findInvoiceById(dto.invoiceId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      // Cannot pay a Drafted invoice — must be approved first
      if (invoice.status === "Drafted") {
        throw { status: 400, message: "Cannot record payment for a Drafted invoice — please approve it first" };
      }

      // Cannot pay a Cancelled invoice
      if (invoice.status === "Cancelled") {
        throw { status: 400, message: "Cannot record payment for a Cancelled invoice" };
      }

      // Check if payment already exists for this invoice
      const existingPayment = await this.paymentDbService.findPaymentByInvoiceId(dto.invoiceId);
      if (existingPayment) {
        throw { status: 409, message: "Payment already recorded for this invoice" };
      }

      // Map fields explicitly onto model instance
      const payment = new Payment();
      payment.invoiceId     = dto.invoiceId;
      payment.paymentDate   = dto.paymentDate;
      payment.forExAmount   = dto.forExAmount;
      payment.currency      = dto.currency;
      payment.indianAmount  = dto.indianAmount;
      payment.isFullPayment = dto.isFullPayment;
      payment.bankPayment   = dto.bankPayment ?? "";
      payment.details       = dto.details ?? "";

      // Save payment via DbService
      const created = await this.paymentDbService.createPayment(payment);

      // Update invoice with payment details via DbService
      await this.invoiceDbService.updateInvoicePayment(
        dto.invoiceId,
        created.id!,
        dto.paymentDate
      );

      this.logger.info(`Payment created successfully with id: ${created.id}`);

      return {
        id:            created.id,
        invoiceId:     created.invoiceId,
        paymentDate:   created.paymentDate,
        forExAmount:   created.forExAmount,
        currency:      created.currency,
        indianAmount:  created.indianAmount,
        isFullPayment: created.isFullPayment,
        bankPayment:   created.bankPayment,
        details:       created.details,
        createdAt:     created.createdAt,
        updatedAt:     created.updatedAt,
      };
    } catch (error: any) {
      this.logger.error("Error creating payment", error);
      throw error.status ? error : { status: 500, message: "Failed to create payment" };
    }
  }

  async getPaymentByInvoiceId(invoiceId: string): Promise<IPayment> {
    try {
      // Check invoice exists first
      const invoice = await this.invoiceDbService.findInvoiceById(invoiceId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      // Fetch payment via DbService
      const payment = await this.paymentDbService.findPaymentByInvoiceId(invoiceId);
      if (!payment) {
        throw { status: 404, message: "No payment found for this invoice" };
      }

      this.logger.info(`Fetched payment for invoiceId: ${invoiceId}`);

      return {
        id:            payment.id,
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
    } catch (error: any) {
      this.logger.error(`Error fetching payment for invoiceId: ${invoiceId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch payment" };
    }
  }
}

export default PaymentService;