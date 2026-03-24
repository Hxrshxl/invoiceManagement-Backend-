import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Customer from "../models/customerModel";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import Invoice from "../models/invoiceModel";
import { CreateCustomerDto } from "../dto/createCustomerDto";
import { ICustomerDbService, IOrganizationDbService } from "../postgresDB/pgInterface";
import { ICustomer } from "../interfaces/customerInterface";

@injectable()
class CustomerService {
  constructor(
    @inject(TYPES.CustomerDbService)
    private readonly customerDbService: ICustomerDbService,

    @inject(TYPES.OrganizationDbService)
    private readonly organizationDbService: IOrganizationDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createCustomer(dto: CreateCustomerDto): Promise<ICustomer> {
    try {
      const organization = await this.organizationDbService.findOrganizationByUId(dto.organizationUId);
      if (!organization) {
        throw { status: 404, message: "Organization not found" };
      }

      const existing = await this.customerDbService.findCustomerByLegalName(dto.legalName);
      if (existing) {
        throw { status: 409, message: "Customer with this legal name already exists" };
      }

      const customer          = new Customer();
      customer.organizationId = organization.id;
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

      return {
        customerUId:      created.customerUId,
        organizationName: organization.legalOrganizationName,
        legalName:        created.legalName,
        shortName:        created.shortName,
        displayName:      created.displayName,
        Sows:             [],
      } as any;
    } catch (error: any) {
      this.logger.error("Error creating customer", error);
      throw error.status ? error : { status: 500, message: "Failed to create customer" };
    }
  }

  async getAllCustomers(): Promise<ICustomer[]> {
    try {
      const customers = await this.customerDbService.findAllCustomers();
      this.logger.info(`Fetched ${customers.length} customers`);

      return customers.map((customer) => {
        const sows = ((customer as any).Sows as Sow[]) ?? [];
        return {
          customerUId: customer.customerUId,
          legalName:   customer.legalName,
          shortName:   customer.shortName,
          displayName: customer.displayName,
          Sows: sows.map((sow) => {
            const plans    = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
            const invoices = ((sow as any).Invoices as Invoice[])               ?? [];
            return {
              sowUId:      sow.sowUId,
              title:       sow.title,
              totalValue:  sow.totalValue,
              SowPaymentPlans: plans.map((plan) => ({
                sowPaymentPlanUId:  plan.sowPaymentPlanUId,
                plannedInvoiceDate: plan.plannedInvoiceDate,
                totalActualAmount:  plan.totalActualAmount,
              })),
              Invoices: invoices.map((invoice) => ({
                invoiceUId:        invoice.invoiceUId,
                status:            invoice.status,
                totalInvoiceValue: invoice.totalInvoiceValue,
                invoiceAmount:     invoice.invoiceAmount,
                paymentReceivedOn: invoice.paymentReceivedOn,
              })),
            };
          }),
        } as any;
      });
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

      const sows = ((customer as any).Sows as Sow[]) ?? [];
      return {
        customerUId: customer.customerUId,
        legalName:   customer.legalName,
        shortName:   customer.shortName,
        displayName: customer.displayName,
        Sows: sows.map((sow) => {
          const plans    = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
          const invoices = ((sow as any).Invoices as Invoice[])               ?? [];
          return {
            sowUId:      sow.sowUId,
            title:       sow.title,
            totalValue:  sow.totalValue,
            SowPaymentPlans: plans.map((plan) => ({
              sowPaymentPlanUId:  plan.sowPaymentPlanUId,
              plannedInvoiceDate: plan.plannedInvoiceDate,
              totalActualAmount:  plan.totalActualAmount,
            })),
            Invoices: invoices.map((invoice) => ({
              invoiceUId:        invoice.invoiceUId,
              status:            invoice.status,
              totalInvoiceValue: invoice.totalInvoiceValue,
              invoiceAmount:     invoice.invoiceAmount,
              paymentReceivedOn: invoice.paymentReceivedOn,
            })),
          };
        }),
      } as any;
    } catch (error: any) {
      this.logger.error(`Error fetching customer with UId: ${customerUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch customer" };
    }
  }
}

export default CustomerService;