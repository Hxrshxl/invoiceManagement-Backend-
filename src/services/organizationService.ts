import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Organization from "../models/organizationModel";
import { CreateOrganizationDto } from "../dto/createOrganizationDto";
import { IOrganizationDbService } from "../postgresDB/pgInterface";
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
      // Check for duplicate email using DbService
      const existingOrganization = await this.organizationDbService.findOrganizationByEmail(dto.email);
      if (existingOrganization) {
        throw { status: 409, message: "Organization with this email already exists" };
      }

      // Map fields explicitly onto model instance
      const organization = new Organization();
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

      // Save via DbService
      const created = await this.organizationDbService.createOrganization(organization);

      this.logger.info(`Organization created successfully with id: ${created.id}`);

      return {
        id:                    created.id,
        gstNo:                 created.gstNo,
        panNo:                 created.panNo,
        legalOrganizationName: created.legalOrganizationName,
        invoiceTemplateId:     created.invoiceTemplateId,
        shortName:             created.shortName,
        contactName:           created.contactName,
        displayName:           created.displayName,
        email:                 created.email,
        addressId:             created.addressId,
        phone:                 created.phone,
        createdAt:             created.createdAt,
        updatedAt:             created.updatedAt,
      };
    } catch (error: any) {
      this.logger.error("Error creating organization", error);
      throw error.status ? error : { status: 500, message: "Failed to create organization" };
    }
  }

  async getAllOrganizations(): Promise<IOrganization[]> {
    try {
      const organizations = await this.organizationDbService.findAllOrganizations();

      this.logger.info(`Fetched ${organizations.length} organizations`);

      return organizations.map((org) => ({
        id:                    org.id,
        gstNo:                 org.gstNo,
        panNo:                 org.panNo,
        legalOrganizationName: org.legalOrganizationName,
        invoiceTemplateId:     org.invoiceTemplateId,
        shortName:             org.shortName,
        contactName:           org.contactName,
        displayName:           org.displayName,
        email:                 org.email,
        addressId:             org.addressId,
        phone:                 org.phone,
        createdAt:             org.createdAt,
        updatedAt:             org.updatedAt,
      }));
    } catch (error: any) {
      this.logger.error("Error fetching organizations", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch organizations" };
    }
  }

  async getOrganizationById(id: string): Promise<IOrganization> {
    try {
      const organization = await this.organizationDbService.findOrganizationById(id);

      if (!organization) {
        throw { status: 404, message: "Organization not found" };
      }

      this.logger.info(`Fetched organization with id: ${id}`);

      return {
        id:                    organization.id,
        gstNo:                 organization.gstNo,
        panNo:                 organization.panNo,
        legalOrganizationName: organization.legalOrganizationName,
        invoiceTemplateId:     organization.invoiceTemplateId,
        shortName:             organization.shortName,
        contactName:           organization.contactName,
        displayName:           organization.displayName,
        email:                 organization.email,
        addressId:             organization.addressId,
        phone:                 organization.phone,
        createdAt:             organization.createdAt,
        updatedAt:             organization.updatedAt,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching organization with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch organization" };
    }
  }
}

export default OrganizationService;