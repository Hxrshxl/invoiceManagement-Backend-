import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import { CreateSowPaymentPlanLineItemDto } from "../dto/createSowPaymentPlanLineItemDto";
import SowPaymentPlanLineItemService from "../services/sowPaymentPlanLineItemService";

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
      const dto = plainToClass(CreateSowPaymentPlanLineItemDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const lineItem = await this.sowPaymentPlanLineItemService.createSowPaymentPlanLineItem(dto);
      res.status(201).json({
        success: true,
        message: "SOW Payment Plan Line Item created successfully",
        data: lineItem,
      });
    } catch (error: any) {
      this.logger.error("Error in createSowPaymentPlanLineItemHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllSowPaymentPlanLineItemsHandler(_req: Request, res: Response): Promise<void> {
    try {
      const lineItems = await this.sowPaymentPlanLineItemService.getAllSowPaymentPlanLineItems();
      res.status(200).json({
        success: true,
        message: "SOW Payment Plan Line Items fetched successfully",
        data: lineItems,
      });
    } catch (error: any) {
      this.logger.error("Error in getAllSowPaymentPlanLineItemsHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getSowPaymentPlanLineItemsByPlanIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowPaymentPlanId } = req.body;

      if (!sowPaymentPlanId) {
        res.status(400).json({
          success: false,
          message: "sowPaymentPlanId is required",
        });
        return;
      }

      const lineItems = await this.sowPaymentPlanLineItemService.getSowPaymentPlanLineItemsByPlanId(sowPaymentPlanId);
      res.status(200).json({
        success: true,
        message: "SOW Payment Plan Line Items fetched successfully",
        data: lineItems,
      });
    } catch (error: any) {
      this.logger.error("Error in getSowPaymentPlanLineItemsByPlanIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default SowPaymentPlanLineItemController;