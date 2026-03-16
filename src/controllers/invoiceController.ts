import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import InvoiceService from "../services/invoiceService";
import { ApproveInvoiceDto, CancelInvoiceDto, GetInvoiceByIdDto } from "../dto/createInvoiceDto";

@injectable()
class InvoiceController {

  constructor(
    @inject(TYPES.InvoiceService)
    private readonly invoiceService: InvoiceService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

async generateInvoicesForTodayHandler(_req: Request, res: Response): Promise<void> {
  try {
    const { invoices, skipped } = await this.invoiceService.generateInvoicesForToday();

    let message = "";

    if (invoices.length > 0 && skipped === 0) {
      message = `${invoices.length} invoice(s) generated successfully`;
    } else if (invoices.length > 0 && skipped > 0) {
      message = `${invoices.length} invoice(s) generated, ${skipped} already invoiced and skipped`;
    } else if (invoices.length === 0 && skipped > 0) {
      message = `All ${skipped} payment plan(s) due today have already been invoiced`;
    } else {
      message = "No payment plans due today";
    }

    res.status(200).json({
      success: true,
      message,
      data: invoices,
    });
  } catch (error: any) {
    this.logger.error("Error in generateInvoicesForTodayHandler", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}

async getAllInvoicesHandler(_req: Request, res: Response): Promise<void> {
    try {
      const invoices = await this.invoiceService.getAllInvoices();
      res.status(200).json({
        success: true,
        message: "Invoices fetched successfully",
        data: invoices,
      });
    } catch (error: any) {
      this.logger.error("Error in getAllInvoicesHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

async getInvoiceByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(GetInvoiceByIdDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const invoice = await this.invoiceService.getInvoiceById(dto.id);
      res.status(200).json({
        success: true,
        message: "Invoice fetched successfully",
        data: invoice,
      });
    } catch (error: any) {
      this.logger.error("Error in getInvoiceByIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

async approveInvoiceHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(ApproveInvoiceDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const invoice = await this.invoiceService.approveInvoice(dto.id);
      res.status(200).json({
        success: true,
        message: "Invoice approved successfully",
        data: invoice,
      });
    } catch (error: any) {
      this.logger.error("Error in approveInvoiceHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

async cancelInvoiceHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CancelInvoiceDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const invoice = await this.invoiceService.cancelInvoice(dto.id);
      res.status(200).json({
        success: true,
        message: "Invoice cancelled successfully",
        data: invoice,
      });
    } catch (error: any) {
      this.logger.error("Error in cancelInvoiceHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default InvoiceController;