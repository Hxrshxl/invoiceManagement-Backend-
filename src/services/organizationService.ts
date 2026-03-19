import { injectable, inject } from "inversify";
import { Logger } from "winston";
import Organization from "../models/organizationModel";
import Customer from "../models/customerModel";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import { CreateOrganizationDto } from "../dto/createOrganizationDto";
import { UpdateOrganizationDto } from "../dto/updateOrganizationDto";
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

  // ─── MAP SOW PAYMENT PLAN LINE ITEM ─────────────────────────────────────────

  private mapSowPaymentPlanLineItem(lineItem: SowPaymentPlanLineItem) {
    return {
      id:                        lineItem.id,
      sowPaymentPlanLineItemUId: lineItem.sowPaymentPlanLineItemUId,
      version:                   lineItem.version,
      archive:                   lineItem.archive,
      sowPaymentPlanId:          lineItem.sowPaymentPlanId,
      sowId:                     lineItem.sowId,
      orderId:                   lineItem.orderId,
      particular:                lineItem.particular,
      rate:                      lineItem.rate,
      unit:                      lineItem.unit,
      total:                     lineItem.total,
      createdAt:                 lineItem.createdAt,
      updatedAt:                 lineItem.updatedAt,
    };
  }

  // ─── MAP SOW PAYMENT PLAN ────────────────────────────────────────────────────

  private mapSowPaymentPlan(plan: SowPaymentPlan) {
    const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
    return {
      id:                      plan.id,
      sowPaymentPlanUId:       plan.sowPaymentPlanUId,
      version:                 plan.version,
      archive:                 plan.archive,
      sowId:                   plan.sowId,
      customerId:              plan.customerId,
      plannedInvoiceDate:      plan.plannedInvoiceDate,
      totalActualAmount:       plan.totalActualAmount,
      createdAt:               plan.createdAt,
      updatedAt:               plan.updatedAt,
      SowPaymentPlanLineItems: lineItems.map((l) => this.mapSowPaymentPlanLineItem(l)),
    };
  }

  // ─── MAP SOW ─────────────────────────────────────────────────────────────────

  private mapSow(sow: Sow) {
    const plans = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
    return {
      id:                    sow.id,
      sowUId:                sow.sowUId,
      version:               sow.version,
      archive:               sow.archive,
      customerId:            sow.customerId,
      title:                 sow.title,
      totalValue:            sow.totalValue,
      currency:              sow.currency,
      validFrom:             sow.validFrom,
      validUpto:             sow.validUpto,
      customerPONumber:      sow.customerPONumber,
      customerSONumber:      sow.customerSONumber,
      invoiceEmailAddresses: sow.invoiceEmailAddresses,
      createdAt:             sow.createdAt,
      updatedAt:             sow.updatedAt,
      SowPaymentPlans:       plans.map((p) => this.mapSowPaymentPlan(p)),
    };
  }

  // ─── MAP CUSTOMER ────────────────────────────────────────────────────────────

  private mapCustomer(customer: Customer) {
    const sows = ((customer as any).Sows as Sow[]) ?? [];
    return {
      id:             customer.id,
      customerUId:    customer.customerUId,
      version:        customer.version,
      archive:        customer.archive,
      organizationId: customer.organizationId,
      legalName:      customer.legalName,
      shortName:      customer.shortName,
      displayName:    customer.displayName,
      addressId:      customer.addressId,
      isMSASigned:    customer.isMSASigned,
      msaSignedOn:    customer.msaSignedOn,
      msaValidFrom:   customer.msaValidFrom,
      msaValidUpto:   customer.msaValidUpto,
      isNDASigned:    customer.isNDASigned,
      ndaSignedOn:    customer.ndaSignedOn,
      ndaValidFrom:   customer.ndaValidFrom,
      ndaValidUpto:   customer.ndaValidUpto,
      createdAt:      customer.createdAt,
      updatedAt:      customer.updatedAt,
      Sows:           sows.map((s) => this.mapSow(s)),
    };
  }

  // ─── MAP ORGANIZATION ────────────────────────────────────────────────────────

  private mapToInterface(org: Organization): IOrganization {
    const customers = ((org as any).Customers as Customer[]) ?? [];
    return {
      id:                    org.id,
      organizationUId:       org.organizationUId,
      version:               org.version,
      archive:               org.archive,
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
      Customers:             customers.map((c) => this.mapCustomer(c)),
    } as any;
  }

  // ─── CREATE ORGANIZATION ─────────────────────────────────────────────────────

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
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating organization", error);
      throw error.status ? error : { status: 500, message: "Failed to create organization" };
    }
  }

  // ─── GET ALL ORGANIZATIONS ───────────────────────────────────────────────────

  async getAllOrganizations(): Promise<IOrganization[]> {
    try {
      const organizations = await this.organizationDbService.findAllOrganizations();
      this.logger.info(`Fetched ${organizations.length} organizations`);
      return organizations.map((org) => this.mapToInterface(org));
    } catch (error: any) {
      this.logger.error("Error fetching organizations", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch organizations" };
    }
  }

  // ─── GET ORGANIZATION BY ID ──────────────────────────────────────────────────

  async getOrganizationById(organizationUId: string): Promise<IOrganization> {
    try {
      const organization = await this.organizationDbService.findOrganizationByUId(organizationUId);
      if (!organization) throw { status: 404, message: "Organization not found" };
      this.logger.info(`Fetched organization with UId: ${organizationUId}`);
      return this.mapToInterface(organization);
    } catch (error: any) {
      this.logger.error(`Error fetching organization with UId: ${organizationUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch organization" };
    }
  }

  // ─── UPDATE ORGANIZATION ─────────────────────────────────────────────────────

  // async updateOrganization(dto: UpdateOrganizationDto): Promise<IOrganization> {
  //   try {
  //     const existing = await this.organizationDbService.findOrganizationByUId(dto.organizationUId);
  //     if (!existing) throw { status: 404, message: "Organization not found" };

  //     if (dto.email && dto.email !== existing.email) {
  //       const emailExists = await this.organizationDbService.findOrganizationByEmail(dto.email);
  //       if (emailExists) throw { status: 409, message: "Organization with this email already exists" };
  //     }

  //     await this.organizationDbService.archiveOrganization(existing.id!);

  //     const updated                    = new Organization();
  //     updated.organizationUId          = existing.organizationUId;
  //     updated.version                  = existing.version + 1;
  //     updated.archive                  = false;
  //     updated.gstNo                    = dto.gstNo                 ?? existing.gstNo;
  //     updated.panNo                    = dto.panNo                 ?? existing.panNo;
  //     updated.legalOrganizationName    = dto.legalOrganizationName ?? existing.legalOrganizationName;
  //     updated.invoiceTemplateId        = dto.invoiceTemplateId     ?? existing.invoiceTemplateId;
  //     updated.shortName                = dto.shortName             ?? existing.shortName;
  //     updated.contactName              = dto.contactName           ?? existing.contactName;
  //     updated.displayName              = dto.displayName           ?? existing.displayName;
  //     updated.email                    = dto.email                 ?? existing.email;
  //     updated.addressId                = dto.addressId             ?? existing.addressId;
  //     updated.phone                    = dto.phone                 ?? existing.phone;

  //     const created = await this.organizationDbService.createOrganization(updated);
  //     this.logger.info(`Organization updated — new id: ${created.id}, version: ${created.version}`);
  //     return this.mapToInterface(created);
  //   } catch (error: any) {
  //     this.logger.error("Error updating organization", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update organization" };
  //   }
  // }

  // ─── DELETE ORGANIZATION ─────────────────────────────────────────────────────

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