import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowService from "../services/sowService";
import { validateDto } from "../common/typeValidation";
import { CreateSowDto } from "../dto/createSowDto";
import { UpdateSowDto } from "../dto/updateSowDto";

@injectable()
class SowController {
  constructor(
    @inject(TYPES.SowService)
    private readonly sowService: SowService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(CreateSowDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const sow = await this.sowService.createSow(dto);
      res.status(201).json({ success: true, message: "SOW created successfully", data: sow });
    } catch (error: any) {
      this.logger.error("Error in createSowHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getAllSowsHandler(_req: Request, res: Response): Promise<void> {
    try {
      const sows = await this.sowService.getAllSows();
      res.status(200).json({ success: true, message: "SOWs fetched successfully", data: sows });
    } catch (error: any) {
      this.logger.error("Error in getAllSowsHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getSowByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowUId } = req.body;
      if (!sowUId) {
        res.status(400).json({ success: false, message: "sowUId is required" });
        return;
      }
      const sow = await this.sowService.getSowById(sowUId);
      res.status(200).json({ success: true, message: "SOW fetched successfully", data: sow });
    } catch (error: any) {
      this.logger.error("Error in getSowByIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async updateSowHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(UpdateSowDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const sow = await this.sowService.updateSow(dto);
      res.status(200).json({ success: true, message: "SOW updated successfully", data: sow });
    } catch (error: any) {
      this.logger.error("Error in updateSowHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async deleteSowHandler(req: Request, res: Response): Promise<void> {
    try {
      const { sowUId } = req.body;
      if (!sowUId) {
        res.status(400).json({ success: false, message: "sowUId is required" });
        return;
      }
      const result = await this.sowService.deleteSow(sowUId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      this.logger.error("Error in deleteSowHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }
}

export default SowController;