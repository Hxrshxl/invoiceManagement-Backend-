import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import OrganizationService from "../services/organizationService";
import { CreateOrganizationDto } from "../dto/createOrganizationDto";
import TYPES from "../types/inversifyTypes";

@injectable()
class OrganizationController {

  constructor(
    @inject(TYPES.OrganizationService)
    private readonly organizationService: OrganizationService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createOrganizationHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateOrganizationDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const organization = await this.organizationService.createOrganization(dto);
      res.status(201).json({
        success: true,
        message: "Organization created successfully",
        data: organization,
      });
    } catch (error: any) {
      this.logger.error("Error in createOrganizationHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllOrganizationsHandler(_req: Request, res: Response): Promise<void> {
    try {
      const organizations = await this.organizationService.getAllOrganizations();
      res.status(200).json({
        success: true,
        message: "Organizations fetched successfully",
        data: organizations,
      });
    } catch (error: any) {
      this.logger.error("Error in getAllOrganizationsHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getOrganizationByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Id is required",
        });
        return;
      }

      const organization = await this.organizationService.getOrganizationById(id);
      res.status(200).json({
        success: true,
        message: "Organization fetched successfully",
        data: organization,
      });
    } catch (error: any) {
      this.logger.error("Error in getOrganizationByIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default OrganizationController;