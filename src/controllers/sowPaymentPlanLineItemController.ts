import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanLineItemService from "../services/sowPaymentPlanLineItemService";
import { validateDto } from "../common/typeValidation";
import { CreateSowPaymentPlanLineItemDto } from "../dto/createSowPaymentPlanLineItemDto";
import { UpdateSowPaymentPlanLineItemDto } from "../dto/updateSowPaymentPlanLineItemDto";

@injectable()
class SowPaymentPlanLineItemController {
  constructor(
    @inject(TYPES.SowPaymentPlanLineItemService)
    private readonly sowPaymentPlanLineItemService: SowPaymentPlanLineItemService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowPaymentPlanLineItemHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(CreateSowPaymentPlanLineItemDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const lineItem = await this.sowPaymentPlanLineItemService.createSowPaymentPlanLineItem(dto);
      res.status(201).json({ success: true, message: "SOW Payment Plan Line Item created successfully", data: lineItem });
    } catch (error: any) {
      this.logger.error("Error in createSowPaymentPlanLineItemHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getAllSowPaymentPlanLineItemsHandler(_req: Request, res: Response): Promise<void> {
    try {
      const lineItems = await this.sowPaymentPlanLineItemService.getAllSowPaymentPlanLineItems();
      res.status(200).json({ success: true, message: "SOW Payment Plan Line Items fetched successfully", data: lineItems });
    } catch (error: any) {
      this.logger.error("Error in getAllSowPaymentPlanLineItemsHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getSowPaymentPlanLineItemsByPlanIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowPaymentPlanId } = req.body;
      if (!sowPaymentPlanId) {
        res.status(400).json({ success: false, message: "sowPaymentPlanId is required" });
        return;
      }
      const lineItems = await this.sowPaymentPlanLineItemService.getSowPaymentPlanLineItemsByPlanId(sowPaymentPlanId);
      res.status(200).json({ success: true, message: "SOW Payment Plan Line Items fetched successfully", data: lineItems });
    } catch (error: any) {
      this.logger.error("Error in getSowPaymentPlanLineItemsByPlanIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async updateSowPaymentPlanLineItemHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(UpdateSowPaymentPlanLineItemDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const lineItem = await this.sowPaymentPlanLineItemService.updateSowPaymentPlanLineItem(dto);
      res.status(200).json({ success: true, message: "SOW Payment Plan Line Item updated successfully", data: lineItem });
    } catch (error: any) {
      this.logger.error("Error in updateSowPaymentPlanLineItemHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async deleteSowPaymentPlanLineItemHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowPaymentPlanLineItemUId } = req.body;
      if (!sowPaymentPlanLineItemUId) {
        res.status(400).json({ success: false, message: "sowPaymentPlanLineItemUId is required" });
        return;
      }
      const result = await this.sowPaymentPlanLineItemService.deleteSowPaymentPlanLineItem(sowPaymentPlanLineItemUId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      this.logger.error("Error in deleteSowPaymentPlanLineItemHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }
}

export default SowPaymentPlanLineItemController;