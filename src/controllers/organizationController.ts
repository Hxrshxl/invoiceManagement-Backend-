import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import OrganizationService from "../services/organizationService";
import { validateDto } from "../common/typeValidation";
import { CreateOrganizationDto } from "../dto/createOrganizationDto";
import { UpdateOrganizationDto } from "../dto/updateOrganizationDto";

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
      const { dto, errors } = await validateDto(CreateOrganizationDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const organization = await this.organizationService.createOrganization(dto);
      res.status(201).json({ success: true, message: "Organization created successfully", data: organization });
    } catch (error: any) {
      this.logger.error("Error in createOrganizationHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getAllOrganizationsHandler(_req: Request, res: Response): Promise<void> {
    try {
      const organizations = await this.organizationService.getAllOrganizations();
      res.status(200).json({ success: true, message: "Organizations fetched successfully", data: organizations });
    } catch (error: any) {
      this.logger.error("Error in getAllOrganizationsHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getOrganizationByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { organizationUId } = req.body;
      if (!organizationUId) {
        res.status(400).json({ success: false, message: "organizationUId is required" });
        return;
      }
      const organization = await this.organizationService.getOrganizationById(organizationUId);
      res.status(200).json({ success: true, message: "Organization fetched successfully", data: organization });
    } catch (error: any) {
      this.logger.error("Error in getOrganizationByIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  // async updateOrganizationHandler(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { dto, errors } = await validateDto(UpdateOrganizationDto, req.body);
  //     if (errors.length > 0) {
  //       res.status(400).json({ success: false, message: "Validation failed", errors });
  //       return;
  //     }
  //     const organization = await this.organizationService.updateOrganization(dto);
  //     res.status(200).json({ success: true, message: "Organization updated successfully", data: organization });
  //   } catch (error: any) {
  //     this.logger.error("Error in updateOrganizationHandler", error);
  //     res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
  //   }
  // }

  // async deleteOrganizationHandler(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { organizationUId } = req.body;
  //     if (!organizationUId) {
  //       res.status(400).json({ success: false, message: "organizationUId is required" });
  //       return;
  //     }
  //     const result = await this.organizationService.deleteOrganization(organizationUId);
  //     res.status(200).json({ success: true, message: result.message });
  //   } catch (error: any) {
  //     this.logger.error("Error in deleteOrganizationHandler", error);
  //     res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
  //   }
  // }
}

export default OrganizationController;