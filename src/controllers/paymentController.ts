import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import PaymentService from "../services/paymentService";
import { validateDto } from "../common/typeValidation";
import { CreatePaymentDto } from "../dto/createPaymentDto";
import { UpdatePaymentDto } from "../dto/updatePaymentDto";

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
      const { dto, errors } = await validateDto(CreatePaymentDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const payment = await this.paymentService.createPayment(dto);
      res.status(201).json({ success: true, message: "Payment created successfully", data: payment });
    } catch (error: any) {
      this.logger.error("Error in createPaymentHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getPaymentByInvoiceIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.body;
      if (!invoiceId) {
        res.status(400).json({ success: false, message: "invoiceId is required" });
        return;
      }
      const payment = await this.paymentService.getPaymentByInvoiceId(invoiceId);
      res.status(200).json({ success: true, message: "Payment fetched successfully", data: payment });
    } catch (error: any) {
      this.logger.error("Error in getPaymentByInvoiceIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  // async updatePaymentHandler(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { dto, errors } = await validateDto(UpdatePaymentDto, req.body);
  //     if (errors.length > 0) {
  //       res.status(400).json({ success: false, message: "Validation failed", errors });
  //       return;
  //     }
  //     const payment = await this.paymentService.updatePayment(dto);
  //     res.status(200).json({ success: true, message: "Payment updated successfully", data: payment });
  //   } catch (error: any) {
  //     this.logger.error("Error in updatePaymentHandler", error);
  //     res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
  //   }
  // }

  // async deletePaymentHandler(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { paymentUId } = req.body;
  //     if (!paymentUId) {
  //       res.status(400).json({ success: false, message: "paymentUId is required" });
  //       return;
  //     }
  //     const result = await this.paymentService.deletePayment(paymentUId);
  //     res.status(200).json({ success: true, message: result.message });
  //   } catch (error: any) {
  //     this.logger.error("Error in deletePaymentHandler", error);
  //     res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
  //   }
  // }
}

export default PaymentController;