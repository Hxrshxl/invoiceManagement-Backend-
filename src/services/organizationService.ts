import { injectable, inject } from "inversify";
import { Logger } from "winston";
import Organization from "../models/organizationModel";
import Customer from "../models/customerModel";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import { CreateOrganizationDto } from "../dto/createOrganizationDto";
import { IOrganizationDbService } from "../postgresDB/pgInterface";
import TYPES from "../types/inversifyTypes";
import { IOrganization } from "../interfaces/organizationInterface";

@injectable()
class OrganizationService {
  constructor(
    @inject(TYPES.OrganizationDbService)
    private readonly organizationDbService: IOrganizationDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createOrganization(dto: CreateOrganizationDto): Promise<IOrganization> {
    try {
      const existing = await this.organizationDbService.findOrganizationByEmail(dto.email);
      if (existing) {
        throw { status: 409, message: "Organization with this email already exists" };
      }

      const organization                 = new Organization();
      organization.gstNo                 = dto.gstNo;
      organization.panNo                 = dto.panNo;
      organization.legalOrganizationName = dto.legalOrganizationName;
      organization.invoiceTemplateId     = dto.invoiceTemplateId;
      organization.shortName             = dto.shortName;
      organization.contactName           = dto.contactName;
      organization.displayName           = dto.displayName;
      organization.email                 = dto.email;
      organization.addressId             = dto.addressId;
      organization.phone                 = dto.phone;

      const created = await this.organizationDbService.createOrganization(organization);
      this.logger.info(`Organization created with id: ${created.id}`);

      return {
        id:                    created.id,
        organizationUId:       created.organizationUId,
        legalOrganizationName: created.legalOrganizationName,
        contactName:           created.contactName,
        displayName:           created.displayName,
        email:                 created.email,
        phone:                 created.phone,
        Customers:             [],
      } as any;
    } catch (error: any) {
      this.logger.error("Error creating organization", error);
      throw error.status ? error : { status: 500, message: "Failed to create organization" };
    }
  }

  async getAllOrganizations(): Promise<IOrganization[]> {
    try {
      const organizations = await this.organizationDbService.findAllOrganizations();
      this.logger.info(`Fetched ${organizations.length} organizations`);

      return organizations.map((org) => {
        const customers = ((org as any).Customers as Customer[]) ?? [];
      return {
        id:                    org.id,
        organizationUId:       org.organizationUId,
        legalOrganizationName: org.legalOrganizationName,
        contactName:           org.contactName,
        displayName:           org.displayName,
        email:                 org.email,
        phone:                 org.phone,
        Customers: customers.map((customer) => {
          const sows = ((customer as any).Sows as Sow[]) ?? [];
            return {
            id:          customer.id,
            customerUId: customer.customerUId,
            legalName:   customer.legalName,
            shortName:   customer.shortName,
            displayName: customer.displayName,
            };
        }),
      } as any;
      });
    } catch (error: any) {
      this.logger.error("Error fetching organizations", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch organizations" };
    }
  }

  async getOrganizationById(organizationUId: string): Promise<IOrganization> {
    try {
      const org = await this.organizationDbService.findOrganizationByUId(organizationUId);
      if (!org) throw { status: 404, message: "Organization not found" };
      this.logger.info(`Fetched organization with UId: ${organizationUId}`);

      const customers = ((org as any).Customers as Customer[]) ?? [];
      return {
        id:                    org.id,
        organizationUId:       org.organizationUId,
        legalOrganizationName: org.legalOrganizationName,
        contactName:           org.contactName,
        displayName:           org.displayName,
        email:                 org.email,
        phone:                 org.phone,
        Customers: customers.map((customer) => {
          const sows = ((customer as any).Sows as Sow[]) ?? [];
            return {
            id:          customer.id,
            customerUId: customer.customerUId,
            legalName:   customer.legalName,
            shortName:   customer.shortName,
            displayName: customer.displayName,
            };
        }),
      } as any;
    } catch (error: any) {
      this.logger.error(`Error fetching organization with UId: ${organizationUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch organization" };
    }
  }

  // async updateOrganization(dto: UpdateOrganizationDto): Promise<IOrganization> {
  //   try {
  //     const existing = await this.organizationDbService.findOrganizationByUId(dto.organizationUId);
  //     if (!existing) throw { status: 404, message: "Organization not found" };

  //     if (dto.email && dto.email !== existing.email) {
  //       const emailExists = await this.organizationDbService.findOrganizationByEmail(dto.email);
  //       if (emailExists) throw { status: 409, message: "Organization with this email already exists" };
  //     }

  //     await this.organizationDbService.archiveOrganization(existing.id!);

  //     const updated                 = new Organization();
  //     updated.organizationUId       = existing.organizationUId;
  //     updated.version               = existing.version + 1;
  //     updated.archive               = false;
  //     updated.gstNo                 = dto.gstNo                 ?? existing.gstNo;
  //     updated.panNo                 = dto.panNo                 ?? existing.panNo;
  //     updated.legalOrganizationName = dto.legalOrganizationName ?? existing.legalOrganizationName;
  //     updated.invoiceTemplateId     = dto.invoiceTemplateId     ?? existing.invoiceTemplateId;
  //     updated.shortName             = dto.shortName             ?? existing.shortName;
  //     updated.contactName           = dto.contactName           ?? existing.contactName;
  //     updated.displayName           = dto.displayName           ?? existing.displayName;
  //     updated.email                 = dto.email                 ?? existing.email;
  //     updated.addressId             = dto.addressId             ?? existing.addressId;
  //     updated.phone                 = dto.phone                 ?? existing.phone;

  //     const created = await this.organizationDbService.createOrganization(updated);
  //     this.logger.info(`Organization updated — new id: ${created.id}, version: ${created.version}`);

  //     return {
  //       id:                    created.id,
  //       organizationUId:       created.organizationUId,
  //       legalOrganizationName: created.legalOrganizationName,
  //       contactName:           created.contactName,
  //       displayName:           created.displayName,
  //       email:                 created.email,
  //       phone:                 created.phone,
  //       Customers:             [],
  //     } as any;
  //   } catch (error: any) {
  //     this.logger.error("Error updating organization", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update organization" };
  //   }
  // }

  // async deleteOrganization(organizationUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.organizationDbService.findOrganizationByUId(organizationUId);
  //     if (!existing) throw { status: 404, message: "Organization not found" };

  //     await this.organizationDbService.archiveOrganization(existing.id!);
  //     this.logger.info(`Organization deleted with organizationUId: ${organizationUId}`);
  //     return { message: "Organization deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting organization", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete organization" };
  //   }
  // }
}

export default OrganizationService;