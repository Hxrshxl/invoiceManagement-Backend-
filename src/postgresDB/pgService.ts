import { injectable } from "inversify";
import Organization from "../models/organizationModel";
import Customer from "../models/customerModel";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import Payment from "../models/paymentModel";
import {
  IOrganizationDbService,
  ICustomerDbService,
  ISowDbService,
  ISowPaymentPlanDbService,
  ISowPaymentPlanLineItemDbService,
  IInvoiceDbService,
  IInvoiceLineItemDbService,
  IPaymentDbService,
} from "./pgInterface";
import { col, fn, where } from "sequelize";

// ─── ORGANIZATION DB SERVICE ──────────────────────────────────────────────────

@injectable()
export class OrganizationDbService implements IOrganizationDbService {

  async createOrganization(organization: Organization): Promise<Organization> {
    return await organization.save();
  }

  async findAllOrganizations(): Promise<Organization[]> {
    return await Organization.findAll();
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    return await Organization.findByPk(id);
  }

  async findOrganizationByEmail(email: string): Promise<Organization | null> {
    return await Organization.findOne({
      where: { email },
    });
  }
}

// ─── CUSTOMER DB SERVICE ──────────────────────────────────────────────────────

@injectable()
export class CustomerDbService implements ICustomerDbService {

  async createCustomer(customer: Customer): Promise<Customer> {
    return await customer.save();
  }

  async findAllCustomers(): Promise<Customer[]> {
    return await Customer.findAll();
  }

  async findCustomerById(id: string): Promise<Customer | null> {
    return await Customer.findByPk(id);
  }

  async findCustomerByLegalName(legalName: string): Promise<Customer | null> {
    return await Customer.findOne({
      where: { legalName },
    });
  }

  async findCustomersByOrganizationId(organizationId: string): Promise<Customer[]> {
    return await Customer.findAll({
      where: { organizationId },
    });
  }
}

// ─── SOW DB SERVICE ───────────────────────────────────────────────────────────

@injectable()
export class SowDbService implements ISowDbService {

  async createSow(sow: Sow): Promise<Sow> {
    return await sow.save();
  }

  async findAllSows(): Promise<Sow[]> {
    return await Sow.findAll();
  }

  async findSowById(id: string): Promise<Sow | null> {
    return await Sow.findByPk(id);
  }

  async findSowByPONumber(customerPONumber: string): Promise<Sow | null> {
    return await Sow.findOne({
      where: { customerPONumber },
    });
  }

  async findSowsByCustomerId(customerId: string): Promise<Sow[]> {
    return await Sow.findAll({
      where: { customerId },
    });
  }
}

// ─── SOW PAYMENT PLAN DB SERVICE ─────────────────────────────────────────────

@injectable()
export class SowPaymentPlanDbService implements ISowPaymentPlanDbService {

  async createSowPaymentPlan(plan: SowPaymentPlan): Promise<SowPaymentPlan> {
    return await plan.save();
  }

  async findAllSowPaymentPlans(): Promise<SowPaymentPlan[]> {
    return await SowPaymentPlan.findAll();
  }

  async findSowPaymentPlanById(id: string): Promise<SowPaymentPlan | null> {
    return await SowPaymentPlan.findByPk(id);
  }

  async findSowPaymentPlansBySowId(sowId: string): Promise<SowPaymentPlan[]> {
    return await SowPaymentPlan.findAll({
      where: { sowId },
    });
  }

 async findSowPaymentPlansByDate(date: string): Promise<SowPaymentPlan[]> {
  return await SowPaymentPlan.findAll({
    where: where(
      fn("DATE", col("plannedInvoiceDate")),
      date
    ),
    include: [
      {
        model: SowPaymentPlanLineItem,
        as: "SowPaymentPlanLineItems",
      },
    ],

  });
}

  async findSowPaymentPlansWithInvoices(): Promise<SowPaymentPlan[]> {
    // Fetch all plans with their associated invoices for schedule view
    return await SowPaymentPlan.findAll({
      include: [
        {
          model: Invoice,
          as: "Invoices",
          required: false,
        },
      ],
    });
  }

  async getTotalPlannedAmountBySowId(sowId: string): Promise<number> {
    // Calculate sum of all payment plan amounts for a SOW
    // Used to validate new plans don't exceed SOW total value
    const plans = await SowPaymentPlan.findAll({
      where: { sowId },
    });
    return plans.reduce((sum, plan) => sum + plan.totalActualAmount, 0);
  }
}

// ─── SOW PAYMENT PLAN LINE ITEM DB SERVICE ───────────────────────────────────

@injectable()
export class SowPaymentPlanLineItemDbService implements ISowPaymentPlanLineItemDbService {

  async createSowPaymentPlanLineItem(lineItem: SowPaymentPlanLineItem): Promise<SowPaymentPlanLineItem> {
    return await lineItem.save();
  }

  async findAllSowPaymentPlanLineItems(): Promise<SowPaymentPlanLineItem[]> {
    return await SowPaymentPlanLineItem.findAll();
  }

  async findSowPaymentPlanLineItemsByPlanId(sowPaymentPlanId: string): Promise<SowPaymentPlanLineItem[]> {
    return await SowPaymentPlanLineItem.findAll({
      where: { sowPaymentPlanId },
    });
  }
}

// ─── INVOICE DB SERVICE ───────────────────────────────────────────────────────

@injectable()
export class InvoiceDbService implements IInvoiceDbService {

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    return await invoice.save();
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return await Invoice.findAll();
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    return await Invoice.findByPk(id);
  }

  async findInvoiceByIdWithLineItems(id: string): Promise<Invoice | null> {
    // Fetch invoice with its line items included in a single query
    return await Invoice.findByPk(id, {
      include: [
        {
          model: InvoiceLineItem,
          as: "InvoiceLineItems",
        },
      ],
    });
  }

  async findInvoiceBySowPaymentPlanId(sowPaymentPlanId: string): Promise<Invoice | null> {
    return await Invoice.findOne({
      where: { sowPaymentPlanId },
    });
  }

  async updateInvoiceStatus(
    id: string,
    status: "Drafted" | "Approved" | "Cancelled"
  ): Promise<Invoice> {
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      throw { status: 404, message: "Invoice not found" };
    }
    invoice.status = status;
    return await invoice.save();
  }

  async updateInvoicePayment(
    id: string,
    paymentId: string,
    paymentDate: Date
  ): Promise<Invoice> {
    // Update invoice with payment details after payment is recorded
    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      throw { status: 404, message: "Invoice not found" };
    }
    invoice.paymentId         = paymentId;
    invoice.paymentReceivedOn = paymentDate;
    return await invoice.save();
  }
}

// ─── INVOICE LINE ITEM DB SERVICE ────────────────────────────────────────────

@injectable()
export class InvoiceLineItemDbService implements IInvoiceLineItemDbService {

  async createInvoiceLineItem(lineItem: InvoiceLineItem): Promise<InvoiceLineItem> {
    return await lineItem.save();
  }

  async findInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<InvoiceLineItem[]> {
    return await InvoiceLineItem.findAll({
      where: { invoiceId },
    });
  }
}

// ─── PAYMENT DB SERVICE ───────────────────────────────────────────────────────

@injectable()
export class PaymentDbService implements IPaymentDbService {

  async createPayment(payment: Payment): Promise<Payment> {
    return await payment.save();
  }

  async findPaymentByInvoiceId(invoiceId: string): Promise<Payment | null> {  
    return await Payment.findOne({
      where: { invoiceId },
    });
  }
}