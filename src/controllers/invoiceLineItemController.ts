import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItemService from "../services/invoiceLineItemService";
import { CreateInvoiceLineItemDto } from "../dto/createInvoiceLineItemDto";

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
      const dto = plainToClass(CreateInvoiceLineItemDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const lineItem = await this.invoiceLineItemService.createInvoiceLineItem(dto);
      res.status(201).json({
        success: true,
        message: "Invoice Line Item created successfully",
        data: lineItem,
      });
    } catch (error: any) {
      this.logger.error("Error in createInvoiceLineItemHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getInvoiceLineItemsByInvoiceIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.body;

      if (!invoiceId) {
        res.status(400).json({
          success: false,
          message: "invoiceId is required",
        });
        return;
      }

      const lineItems = await this.invoiceLineItemService.getInvoiceLineItemsByInvoiceId(invoiceId);
      res.status(200).json({
        success: true,
        message: "Invoice Line Items fetched successfully",
        data: lineItems,
      });
    } catch (error: any) {
      this.logger.error("Error in getInvoiceLineItemsByInvoiceIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default InvoiceLineItemController;