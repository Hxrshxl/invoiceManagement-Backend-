import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import InvoiceService from "../services/invoiceService";
import { validateDto } from "../common/typeValidation";
import { UpdateInvoiceDto } from "../dto/updateInvoiceDto";

@injectable()
class InvoiceController {
  constructor(
    @inject(TYPES.InvoiceService)
    private readonly invoiceService: InvoiceService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async generateInvoicesForTodayHandler(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.body;
      const { invoices, skipped } = await this.invoiceService.generateInvoicesForToday(date);

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

      res.status(200).json({ success: true, message, data: invoices });
    } catch (error: any) {
      this.logger.error("Error in generateInvoicesForTodayHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getAllInvoicesHandler(_req: Request, res: Response): Promise<void> {
    try {
      const invoices = await this.invoiceService.getAllInvoices();
      res.status(200).json({ success: true, message: "Invoices fetched successfully", data: invoices });
    } catch (error: any) {
      this.logger.error("Error in getAllInvoicesHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getInvoiceByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceUId, export: exportPdf } = req.body;
      if (!invoiceUId) {
        res.status(400).json({ success: false, message: "invoiceUId is required" });
        return;
      }

      if (exportPdf === true) {
        const pdfBuffer = await this.invoiceService.generateInvoicePdf(invoiceUId);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoiceUId}.pdf`);
        res.send(pdfBuffer);
        return;
      }

      const invoice = await this.invoiceService.getInvoiceById(invoiceUId);
      res.status(200).json({ success: true, message: "Invoice fetched successfully", data: invoice });
    } catch (error: any) {
      this.logger.error("Error in getInvoiceByIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async approveInvoiceHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceUId } = req.body;
      if (!invoiceUId) {
        res.status(400).json({ success: false, message: "invoiceUId is required" });
        return;
      }
      const invoice = await this.invoiceService.approveInvoice(invoiceUId);
      res.status(200).json({ success: true, message: "Invoice approved successfully", data: invoice });
    } catch (error: any) {
      this.logger.error("Error in approveInvoiceHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async cancelInvoiceHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceUId } = req.body;
      if (!invoiceUId) {
        res.status(400).json({ success: false, message: "invoiceUId is required" });
        return;
      }
      const invoice = await this.invoiceService.cancelInvoice(invoiceUId);
      res.status(200).json({ success: true, message: "Invoice cancelled successfully", data: invoice });
    } catch (error: any) {
      this.logger.error("Error in cancelInvoiceHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  // async updateInvoiceHandler(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { dto, errors } = await validateDto(UpdateInvoiceDto, req.body);
  //     if (errors.length > 0) {
  //       res.status(400).json({ success: false, message: "Validation failed", errors });
  //       return;
  //     }
  //     const invoice = await this.invoiceService.updateInvoice(dto);
  //     res.status(200).json({ success: true, message: "Invoice updated successfully", data: invoice });
  //   } catch (error: any) {
  //     this.logger.error("Error in updateInvoiceHandler", error);
  //     res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
  //   }
  // }

  // async deleteInvoiceHandler(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { invoiceUId } = req.body;
  //     if (!invoiceUId) {
  //       res.status(400).json({ success: false, message: "invoiceUId is required" });
  //       return;
  //     }
  //     const result = await this.invoiceService.deleteInvoice(invoiceUId);
  //     res.status(200).json({ success: true, message: result.message });
  //   } catch (error: any) {
  //     this.logger.error("Error in deleteInvoiceHandler", error);
  //     res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
  //   }
  // }
}

export default InvoiceController;