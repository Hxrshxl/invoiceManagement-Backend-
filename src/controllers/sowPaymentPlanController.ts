import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanService from "../services/sowPaymentPlanService";
import { validateDto } from "../common/typeValidation";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";
import { UpdateSowPaymentPlanDto } from "../dto/updateSowPaymentPlanDto";

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
      const { dto, errors } = await validateDto(CreateSowPaymentPlanDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const plan = await this.sowPaymentPlanService.createSowPaymentPlan(dto);
      res.status(201).json({ success: true, message: "SOW Payment Plan created successfully", data: plan });
    } catch (error: any) {
      this.logger.error("Error in createSowPaymentPlanHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getAllSowPaymentPlansHandler(_req: Request, res: Response): Promise<void> {
    try {
      const plans = await this.sowPaymentPlanService.getAllSowPaymentPlans();
      res.status(200).json({ success: true, message: "SOW Payment Plans fetched successfully", data: plans });
    } catch (error: any) {
      this.logger.error("Error in getAllSowPaymentPlansHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getSowPaymentPlanByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowPaymentPlanUId } = req.body;
      if (!sowPaymentPlanUId) {
        res.status(400).json({ success: false, message: "sowPaymentPlanUId is required" });
        return;
      }
      const plan = await this.sowPaymentPlanService.getSowPaymentPlanById(sowPaymentPlanUId);
      res.status(200).json({ success: true, message: "SOW Payment Plan fetched successfully", data: plan });
    } catch (error: any) {
      this.logger.error("Error in getSowPaymentPlanByIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getSowPaymentPlansBySowIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowId } = req.body;
      if (!sowId) {
        res.status(400).json({ success: false, message: "sowId is required" });
        return;
      }
      const plans = await this.sowPaymentPlanService.getSowPaymentPlansBySowId(sowId);
      res.status(200).json({ success: true, message: "SOW Payment Plans fetched successfully", data: plans });
    } catch (error: any) {
      this.logger.error("Error in getSowPaymentPlansBySowIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async updateSowPaymentPlanHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(UpdateSowPaymentPlanDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const plan = await this.sowPaymentPlanService.updateSowPaymentPlan(dto);
      res.status(200).json({ success: true, message: "SOW Payment Plan updated successfully", data: plan });
    } catch (error: any) {
      this.logger.error("Error in updateSowPaymentPlanHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async deleteSowPaymentPlanHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowPaymentPlanUId } = req.body;
      if (!sowPaymentPlanUId) {
        res.status(400).json({ success: false, message: "sowPaymentPlanUId is required" });
        return;
      }
      const result = await this.sowPaymentPlanService.deleteSowPaymentPlan(sowPaymentPlanUId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      this.logger.error("Error in deleteSowPaymentPlanHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getInvoiceScheduleHandler(_req: Request, res: Response): Promise<void> {
    try {
      const schedule = await this.sowPaymentPlanService.getInvoiceSchedule();
      res.status(200).json({ success: true, message: "Invoice schedule fetched successfully", data: schedule });
    } catch (error: any) {
      this.logger.error("Error in getInvoiceScheduleHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }
}

export default SowPaymentPlanController;