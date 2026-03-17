import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanService from "../services/sowPaymentPlanService";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";

@injectable()
class SowPaymentPlanController {

  constructor(
    @inject(TYPES.SowPaymentPlanService)
    private readonly sowPaymentPlanService: SowPaymentPlanService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowPaymentPlanHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateSowPaymentPlanDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const sowPaymentPlan = await this.sowPaymentPlanService.createSowPaymentPlan(dto);
      res.status(201).json({
        success: true,
        message: "SOW Payment Plan created successfully",
        data: sowPaymentPlan,
      });
    } catch (error: any) {
      this.logger.error("Error in createSowPaymentPlanHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllSowPaymentPlansHandler(_req: Request, res: Response): Promise<void> {
    try {
      const sowPaymentPlans = await this.sowPaymentPlanService.getAllSowPaymentPlans();
      res.status(200).json({
        success: true,
        message: "SOW Payment Plans fetched successfully",
        data: sowPaymentPlans,
      });
    } catch (error: any) {
      this.logger.error("Error in getAllSowPaymentPlansHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getSowPaymentPlanByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Id is required",
        });
        return;
      }

      const sowPaymentPlan = await this.sowPaymentPlanService.getSowPaymentPlanById(id);
      res.status(200).json({
        success: true,
        message: "SOW Payment Plan fetched successfully",
        data: sowPaymentPlan,
      });
    } catch (error: any) {
      this.logger.error("Error in getSowPaymentPlanByIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getSowPaymentPlansBySowIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowId } = req.body;

      if (!sowId) {
        res.status(400).json({
          success: false,
          message: "sowId is required",
        });
        return;
      }

      const sowPaymentPlans = await this.sowPaymentPlanService.getSowPaymentPlansBySowId(sowId);
      res.status(200).json({
        success: true,
        message: "SOW Payment Plans fetched successfully",
        data: sowPaymentPlans,
      });
    } catch (error: any) {
      this.logger.error("Error in getSowPaymentPlansBySowIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getInvoiceScheduleHandler(_req: Request, res: Response): Promise<void> {
  try {
    const schedule = await this.sowPaymentPlanService.getInvoiceSchedule();
    res.status(200).json({
      success: true,
      message: "Invoice schedule fetched successfully",
      data: schedule,
    });
  } catch (error: any) {
    this.logger.error("Error in getInvoiceScheduleHandler", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
}

export default SowPaymentPlanController;