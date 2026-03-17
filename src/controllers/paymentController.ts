import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import PaymentService from "../services/paymentService";
import { CreatePaymentDto } from "../dto/createPaymentDto";
import TYPES from "../types/inversifyTypes";

@injectable()
class PaymentController {

  constructor(
    @inject(TYPES.PaymentService)
    private readonly paymentService: PaymentService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createPaymentHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreatePaymentDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const payment = await this.paymentService.createPayment(dto);
      res.status(201).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
      });
    } catch (error: any) {
      this.logger.error("Error in createPaymentHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getPaymentByInvoiceIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.body;

      if (!invoiceId) {
        res.status(400).json({
          success: false,
          message: "invoiceId is required",
        });
        return;
      }

      const payment = await this.paymentService.getPaymentByInvoiceId(invoiceId);
      res.status(200).json({
        success: true,
        message: "Payment fetched successfully",
        data: payment,
      });
    } catch (error: any) {
      this.logger.error("Error in getPaymentByInvoiceIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default PaymentController;