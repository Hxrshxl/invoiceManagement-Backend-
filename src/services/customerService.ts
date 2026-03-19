import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Customer from "../models/customerModel";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import { CreateCustomerDto } from "../dto/createCustomerDto";
import { UpdateCustomerDto } from "../dto/updateCustomerDto";
import { ICustomerDbService } from "../postgresDB/pgInterface";
import { ICustomer } from "../interfaces/customerInterface";
import { InvoiceLineItem, Payment } from "../models";

@injectable()
class CustomerService {
  constructor(
    @inject(TYPES.CustomerDbService)
    private readonly customerDbService: ICustomerDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  private mapInvoice(invoice: Invoice) {
  return {
    id:                invoice.id,
    invoiceUId:        invoice.invoiceUId,
    version:           invoice.version,
    archive:           invoice.archive,
    sowId:             invoice.sowId,
    sowPaymentPlanId:  invoice.sowPaymentPlanId,
    customerId:        invoice.customerId,
    status:            invoice.status,
    totalInvoiceValue: invoice.totalInvoiceValue,
    invoiceAmount:     invoice.invoiceAmount,
    invoiceTaxAmount:  invoice.invoiceTaxAmount,
    invoiceSentOn:     invoice.invoiceSentOn,
    paymentReceivedOn: invoice.paymentReceivedOn,
    invoiceVersionNo:  invoice.invoiceVersionNo,
    paymentId:         invoice.paymentId,
    createdAt:         invoice.createdAt,
    updatedAt:         invoice.updatedAt,
  };
}

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

  private mapSowPaymentPlan(plan: SowPaymentPlan) {
    const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
    return {
      id:                 plan.id,
      sowPaymentPlanUId:  plan.sowPaymentPlanUId,
      version:            plan.version,
      archive:            plan.archive,
      sowId:              plan.sowId,
      customerId:         plan.customerId,
      plannedInvoiceDate: plan.plannedInvoiceDate,
      totalActualAmount:  plan.totalActualAmount,
      createdAt:          plan.createdAt,
      updatedAt:          plan.updatedAt,
      SowPaymentPlanLineItems: lineItems.map((l) => this.mapSowPaymentPlanLineItem(l)),
    };
  }

  private mapSow(sow: Sow) {
    const plans    = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
    const invoices = ((sow as any).Invoices as Invoice[])               ?? [];
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
      Invoices:              invoices.map((i) => this.mapInvoice(i)),
    };
  }

  private mapToInterface(customer: Customer): ICustomer {
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
    } as any;
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

  // async updateCustomer(dto: UpdateCustomerDto): Promise<ICustomer> {
  //   try {
  //     const existing = await this.customerDbService.findCustomerByUId(dto.customerUId);
  //     if (!existing) {
  //       throw { status: 404, message: "Customer not found" };
  //     }

  //     await this.customerDbService.archiveCustomer(existing.id!);

  //     const updated = new Customer();
  //     updated.customerUId    = existing.customerUId;
  //     updated.version        = existing.version + 1;
  //     updated.archive        = false;
  //     updated.organizationId = existing.organizationId;
  //     updated.legalName      = dto.legalName    ?? existing.legalName;
  //     updated.shortName      = dto.shortName    ?? existing.shortName;
  //     updated.displayName    = dto.displayName  ?? existing.displayName;
  //     updated.addressId      = dto.addressId    ?? existing.addressId;
  //     updated.isMSASigned    = dto.isMSASigned  ?? existing.isMSASigned;
  //     updated.msaSignedOn    = dto.msaSignedOn  ?? existing.msaSignedOn;
  //     updated.msaValidFrom   = dto.msaValidFrom ?? existing.msaValidFrom;
  //     updated.msaValidUpto   = dto.msaValidUpto ?? existing.msaValidUpto;
  //     updated.isNDASigned    = dto.isNDASigned  ?? existing.isNDASigned;
  //     updated.ndaSignedOn    = dto.ndaSignedOn  ?? existing.ndaSignedOn;
  //     updated.ndaValidFrom   = dto.ndaValidFrom ?? existing.ndaValidFrom;
  //     updated.ndaValidUpto   = dto.ndaValidUpto ?? existing.ndaValidUpto;

  //     const created = await this.customerDbService.createCustomer(updated);
  //     this.logger.info(`Customer updated with UId: ${dto.customerUId} version: ${created.version}`);
  //     return this.mapToInterface(created);
  //   } catch (error: any) {
  //     this.logger.error("Error updating customer", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update customer" };
  //   }
  // }

  // async deleteCustomer(customerUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.customerDbService.findCustomerByUId(customerUId);
  //     if (!existing) {
  //       throw { status: 404, message: "Customer not found" };
  //     }
  //     await this.customerDbService.archiveCustomer(existing.id!);
  //     this.logger.info(`Customer deleted with UId: ${customerUId}`);
  //     return { message: "Customer deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting customer", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete customer" };
  //   }
  // }
}

export default CustomerService;