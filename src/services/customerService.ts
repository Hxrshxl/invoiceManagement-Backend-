import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Customer from "../models/customerModel";
import { CreateCustomerDto } from "../dto/createCustomerDto";
import { UpdateCustomerDto } from "../dto/updateCustomerDto";
import { ICustomerDbService } from "../postgresDB/pgInterface";
import { ICustomer } from "../interfaces/customerInterface";

@injectable()
class CustomerService {
  constructor(
    @inject(TYPES.CustomerDbService)
    private readonly customerDbService: ICustomerDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  private mapToInterface(customer: Customer): ICustomer {
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
    };
  }

  async createCustomer(dto: CreateCustomerDto): Promise<ICustomer> {
    try {
      const existing = await this.customerDbService.findCustomerByLegalName(dto.legalName);
      if (existing) {
        throw { status: 409, message: "Customer with this legal name already exists" };
      }

      const customer = new Customer();
      customer.organizationId = dto.organizationId;
      customer.legalName      = dto.legalName;
      customer.shortName      = dto.shortName;
      customer.displayName    = dto.displayName;
      customer.addressId      = dto.addressId;
      customer.isMSASigned    = dto.isMSASigned;
      customer.msaSignedOn    = dto.msaSignedOn;
      customer.msaValidFrom   = dto.msaValidFrom;
      customer.msaValidUpto   = dto.msaValidUpto;
      customer.isNDASigned    = dto.isNDASigned;
      customer.ndaSignedOn    = dto.ndaSignedOn;
      customer.ndaValidFrom   = dto.ndaValidFrom;
      customer.ndaValidUpto   = dto.ndaValidUpto;
      customer.version        = 1;
      customer.archive        = false;

      const created = await this.customerDbService.createCustomer(customer);
      this.logger.info(`Customer created with id: ${created.id}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating customer", error);
      throw error.status ? error : { status: 500, message: "Failed to create customer" };
    }
  }

  async getAllCustomers(): Promise<ICustomer[]> {
    try {
      const customers = await this.customerDbService.findAllCustomers();
      this.logger.info(`Fetched ${customers.length} customers`);
      return customers.map((c) => this.mapToInterface(c));
    } catch (error: any) {
      this.logger.error("Error fetching customers", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch customers" };
    }
  }

  async getCustomerById(customerUId: string): Promise<ICustomer> {
    try {
      const customer = await this.customerDbService.findCustomerByUId(customerUId);
      if (!customer) {
        throw { status: 404, message: "Customer not found" };
      }
      this.logger.info(`Fetched customer with UId: ${customerUId}`);
      return this.mapToInterface(customer);
    } catch (error: any) {
      this.logger.error(`Error fetching customer with UId: ${customerUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch customer" };
    }
  }

  async updateCustomer(dto: UpdateCustomerDto): Promise<ICustomer> {
    try {
      const existing = await this.customerDbService.findCustomerByUId(dto.customerUId);
      if (!existing) {
        throw { status: 404, message: "Customer not found" };
      }

      await this.customerDbService.archiveCustomer(existing.id!);

      const updated = new Customer();
      updated.customerUId    = existing.customerUId;
      updated.version        = existing.version + 1;
      updated.archive        = false;
      updated.organizationId = existing.organizationId;
      updated.legalName      = dto.legalName    ?? existing.legalName;
      updated.shortName      = dto.shortName    ?? existing.shortName;
      updated.displayName    = dto.displayName  ?? existing.displayName;
      updated.addressId      = dto.addressId    ?? existing.addressId;
      updated.isMSASigned    = dto.isMSASigned  ?? existing.isMSASigned;
      updated.msaSignedOn    = dto.msaSignedOn  ?? existing.msaSignedOn;
      updated.msaValidFrom   = dto.msaValidFrom ?? existing.msaValidFrom;
      updated.msaValidUpto   = dto.msaValidUpto ?? existing.msaValidUpto;
      updated.isNDASigned    = dto.isNDASigned  ?? existing.isNDASigned;
      updated.ndaSignedOn    = dto.ndaSignedOn  ?? existing.ndaSignedOn;
      updated.ndaValidFrom   = dto.ndaValidFrom ?? existing.ndaValidFrom;
      updated.ndaValidUpto   = dto.ndaValidUpto ?? existing.ndaValidUpto;

      const created = await this.customerDbService.createCustomer(updated);
      this.logger.info(`Customer updated with UId: ${dto.customerUId} version: ${created.version}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error updating customer", error);
      throw error.status ? error : { status: 500, message: "Failed to update customer" };
    }
  }

  async deleteCustomer(customerUId: string): Promise<{ message: string }> {
    try {
      const existing = await this.customerDbService.findCustomerByUId(customerUId);
      if (!existing) {
        throw { status: 404, message: "Customer not found" };
      }
      await this.customerDbService.archiveCustomer(existing.id!);
      this.logger.info(`Customer deleted with UId: ${customerUId}`);
      return { message: "Customer deleted successfully" };
    } catch (error: any) {
      this.logger.error("Error deleting customer", error);
      throw error.status ? error : { status: 500, message: "Failed to delete customer" };
    }
  }
}

export default CustomerService;