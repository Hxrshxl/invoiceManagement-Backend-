import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Customer from "../models/customerModel";
import { CreateCustomerDto } from "../dto/createCustomerDto";
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

  async createCustomer(dto: CreateCustomerDto): Promise<ICustomer> {
    try {
      // Check for duplicate legalName using DbService
      const existingCustomer = await this.customerDbService.findCustomerByLegalName(dto.legalName);
      if (existingCustomer) {
        throw { status: 409, message: "Customer with this legal name already exists" };
      }

      // Map fields explicitly onto model instance
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

      // Save via DbService
      const created = await this.customerDbService.createCustomer(customer);

      this.logger.info(`Customer created successfully with id: ${created.id}`);

      return {
        id:             created.id,
        organizationId: created.organizationId,
        legalName:      created.legalName,
        shortName:      created.shortName,
        displayName:    created.displayName,
        addressId:      created.addressId,
        isMSASigned:    created.isMSASigned,
        msaSignedOn:    created.msaSignedOn,
        msaValidFrom:   created.msaValidFrom,
        msaValidUpto:   created.msaValidUpto,
        isNDASigned:    created.isNDASigned,
        ndaSignedOn:    created.ndaSignedOn,
        ndaValidFrom:   created.ndaValidFrom,
        ndaValidUpto:   created.ndaValidUpto,
        createdAt:      created.createdAt,
        updatedAt:      created.updatedAt,
      };
    } catch (error: any) {
      this.logger.error("Error creating customer", error);
      throw error.status ? error : { status: 500, message: "Failed to create customer" };
    }
  }

  async getAllCustomers(): Promise<ICustomer[]> {
    try {
      const customers = await this.customerDbService.findAllCustomers();

      this.logger.info(`Fetched ${customers.length} customers`);

      return customers.map((customer) => ({
        id:             customer.id,
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
      }));
    } catch (error: any) {
      this.logger.error("Error fetching customers", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch customers" };
    }
  }

  async getCustomerById(id: string): Promise<ICustomer> {
    try {
      const customer = await this.customerDbService.findCustomerById(id);

      if (!customer) {
        throw { status: 404, message: "Customer not found" };
      }

      this.logger.info(`Fetched customer with id: ${id}`);

      return {
        id:             customer.id,
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
    } catch (error: any) {
      this.logger.error(`Error fetching customer with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch customer" };
    }
  }
}

export default CustomerService;