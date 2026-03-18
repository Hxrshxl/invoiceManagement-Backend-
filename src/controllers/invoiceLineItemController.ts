import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItemService from "../services/invoiceLineItemService";
import { validateDto } from "../common/typeValidation";
import { CreateInvoiceLineItemDto } from "../dto/createInvoiceLineItemDto";
import { UpdateInvoiceLineItemDto } from "../dto/updateInvoiceLineItemDto";

@injectable()
class InvoiceLineItemController {
  constructor(
    @inject(TYPES.InvoiceLineItemService)
    private readonly invoiceLineItemService: InvoiceLineItemService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createInvoiceLineItemHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(CreateInvoiceLineItemDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const lineItem = await this.invoiceLineItemService.createInvoiceLineItem(dto);
      res.status(201).json({ success: true, message: "Invoice Line Item created successfully", data: lineItem });
    } catch (error: any) {
      this.logger.error("Error in createInvoiceLineItemHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getInvoiceLineItemsByInvoiceIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.body;
      if (!invoiceId) {
        res.status(400).json({ success: false, message: "invoiceId is required" });
        return;
      }
      const lineItems = await this.invoiceLineItemService.getInvoiceLineItemsByInvoiceId(invoiceId);
      res.status(200).json({ success: true, message: "Invoice Line Items fetched successfully", data: lineItems });
    } catch (error: any) {
      this.logger.error("Error in getInvoiceLineItemsByInvoiceIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async updateInvoiceLineItemHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(UpdateInvoiceLineItemDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const lineItem = await this.invoiceLineItemService.updateInvoiceLineItem(dto);
      res.status(200).json({ success: true, message: "Invoice Line Item updated successfully", data: lineItem });
    } catch (error: any) {
      this.logger.error("Error in updateInvoiceLineItemHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async deleteInvoiceLineItemHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceLineItemUId } = req.body;
      if (!invoiceLineItemUId) {
        res.status(400).json({ success: false, message: "invoiceLineItemUId is required" });
        return;
      }
      const result = await this.invoiceLineItemService.deleteInvoiceLineItem(invoiceLineItemUId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      this.logger.error("Error in deleteInvoiceLineItemHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }
}

export default InvoiceLineItemController;