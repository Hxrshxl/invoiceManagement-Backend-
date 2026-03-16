import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import SowService from "../services/sowService";
import { CreateSowDto } from "../dto/createSowDto";
import TYPES from "../types/inversifyTypes";

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
      const dto = plainToClass(CreateSowDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const sow = await this.sowService.createSow(dto);
      res.status(201).json({
        success: true,
        message: "SOW created successfully",
        data: sow,
      });
    } catch (error: any) {
      this.logger.error("Error in createSowHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllSowsHandler(_req: Request, res: Response): Promise<void> {
    try {
      const sows = await this.sowService.getAllSows();
      res.status(200).json({
        success: true,
        message: "SOWs fetched successfully",
        data: sows,
      });
    } catch (error: any) {
      this.logger.error("Error in getAllSowsHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getSowByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Id is required",
        });
        return;
      }

      const sow = await this.sowService.getSowById(id);
      res.status(200).json({
        success: true,
        message: "SOW fetched successfully",
        data: sow,
      });
    } catch (error: any) {
      this.logger.error("Error in getSowByIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default SowController;