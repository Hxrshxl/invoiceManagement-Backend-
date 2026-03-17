import { injectable, inject } from "inversify";
import { Logger } from "winston";
import Payment from "../models/paymentModel";
import Invoice from "../models/invoiceModel";
import { CreatePaymentDto } from "../dto/createPaymentDto";
import { IPayment } from "../interfaces/paymentInterface";
import TYPES from "../types/inversifyTypes";

@injectable()
class PaymentService {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<IPayment> {
    try {
      const invoice = await Invoice.findByPk(dto.invoiceId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      if (invoice.status === "Drafted") {
        throw { status: 400, message: "Cannot record payment for a Drafted invoice — please approve it first" };
      }

      if (invoice.status === "Cancelled") {
        throw { status: 400, message: "Cannot record payment for a Cancelled invoice" };
      }

      const existingPayment = await Payment.findOne({
        where: { invoiceId: dto.invoiceId },
      });

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
      payment.details       = dto.details ?? "";

      const created = await payment.save();

      invoice.paymentReceivedOn = dto.paymentDate;
      invoice.paymentId         = created.id!;
      await invoice.save();

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
      const invoice = await Invoice.findByPk(invoiceId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      const payment = await Payment.findOne({
        where: { invoiceId },
      });

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