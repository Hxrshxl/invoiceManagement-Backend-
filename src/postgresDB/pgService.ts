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

// ─── ORGANIZATION DB SERVICE ──────────────────────────────────────────────────

@injectable()
export class OrganizationDbService implements IOrganizationDbService {

  async createOrganization(organization: Organization): Promise<Organization> {
    return await organization.save();
  }

  async findAllOrganizations(): Promise<Organization[]> {
    return await Organization.findAll({
      where: { archive: false },
      include: [
        {
          model: Customer,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findOrganizationById(id: string): Promise<Organization | null> {
    return await Organization.findOne({
      where: { id, archive: false },
    });
  }

  async findOrganizationByUId(organizationUId: string): Promise<Organization | null> {
    return await Organization.findOne({
      where: { organizationUId, archive: false },
      include: [
        {
          model: Customer,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findOrganizationByEmail(email: string): Promise<Organization | null> {
    return await Organization.findOne({
      where: { email, archive: false },
    });
  }

  async archiveOrganization(id: string): Promise<Organization> {
    const organization = await Organization.findOne({
      where: { id, archive: false },
    });
    if (!organization) throw { status: 404, message: "Organization not found" };
    organization.archive = true;
    return await organization.save();
  }
}

// ─── CUSTOMER DB SERVICE ──────────────────────────────────────────────────────

@injectable()
export class CustomerDbService implements ICustomerDbService {

  async createCustomer(customer: Customer): Promise<Customer> {
    return await customer.save();
  }

  async findAllCustomers(): Promise<Customer[]> {
    const customers = await Customer.findAll({
      where: { archive: false },
    });

    const enriched = await Promise.all(
      customers.map(async (customer) => {
        const allVersions = await Customer.findAll({
          where: { customerUId: customer.customerUId },
          attributes: ["id"],
        });
        const allCustomerIds = allVersions.map((v) => v.id);

        const sows = await Sow.findAll({
          where: { customerId: allCustomerIds, archive: false },
        });

        const enrichedSows = await Promise.all(
          sows.map(async (sow) => {
            const allSowVersions = await Sow.findAll({
              where: { sowUId: sow.sowUId },
              attributes: ["id"],
            });
            const allSowIds = allSowVersions.map((v) => v.id);

            const sowPaymentPlans = await SowPaymentPlan.findAll({
              where: { sowId: allSowIds, archive: false },
            });

            const invoices = await Invoice.findAll({
              where: { sowId: allSowIds, archive: false },
            });

            (sow as any).SowPaymentPlans = sowPaymentPlans;
            (sow as any).Invoices        = invoices;
            return sow;
          })
        );

        (customer as any).Sows = enrichedSows;
        return customer;
      })
    );

    return enriched;
  }

  async findCustomerById(id: string): Promise<Customer | null> {
    return await Customer.findOne({
      where: { id, archive: false },
    });
  }

  async findCustomerByUId(customerUId: string): Promise<Customer | null> {
    const customer = await Customer.findOne({
      where: { customerUId, archive: false },
    });
    if (!customer) return null;

    const allVersions = await Customer.findAll({
      where: { customerUId },
      attributes: ["id"],
    });
    const allCustomerIds = allVersions.map((v) => v.id);

    const sows = await Sow.findAll({
      where: { customerId: allCustomerIds, archive: false },
    });

    const enrichedSows = await Promise.all(
      sows.map(async (sow) => {
        const allSowVersions = await Sow.findAll({
          where: { sowUId: sow.sowUId },
          attributes: ["id"],
        });
        const allSowIds = allSowVersions.map((v) => v.id);

        const sowPaymentPlans = await SowPaymentPlan.findAll({
          where: { sowId: allSowIds, archive: false },
        });

        const invoices = await Invoice.findAll({
          where: { sowId: allSowIds, archive: false },
        });

        (sow as any).SowPaymentPlans = sowPaymentPlans;
        (sow as any).Invoices        = invoices;
        return sow;
      })
    );

    (customer as any).Sows = enrichedSows;
    return customer;
  }

  async findCustomerByLegalName(legalName: string): Promise<Customer | null> {
    return await Customer.findOne({
      where: { legalName, archive: false },
    });
  }

  async findCustomersByOrganizationId(organizationId: string): Promise<Customer[]> {
    return await Customer.findAll({
      where: { organizationId, archive: false },
    });
  }

  async archiveCustomer(id: string): Promise<Customer> {
    const customer = await Customer.findOne({
      where: { id, archive: false },
    });
    if (!customer) throw { status: 404, message: "Customer not found" };
    customer.archive = true;
    return await customer.save();
  }
}

// ─── SOW DB SERVICE ───────────────────────────────────────────────────────────

@injectable()
export class SowDbService implements ISowDbService {

  async createSow(sow: Sow): Promise<Sow> {
    return await sow.save();
  }

  async findAllSows(): Promise<Sow[]> {
    const sows = await Sow.findAll({
      where: { archive: false },
    });

    const enriched = await Promise.all(
      sows.map(async (sow) => {
        const allVersions = await Sow.findAll({
          where: { sowUId: sow.sowUId },
          attributes: ["id"],
        });
        const allSowIds = allVersions.map((v) => v.id);

        const plans = await SowPaymentPlan.findAll({
          where: { sowId: allSowIds, archive: false },
          include: [
            {
              model: SowPaymentPlanLineItem,
              as: "SowPaymentPlanLineItems",
              where: { archive: false },
              required: false,
            },
          ],
        });

        const invoices = await Invoice.findAll({
          where: { sowId: allSowIds, archive: false },
          include: [
            {
              model: InvoiceLineItem,
              as: "InvoiceLineItems",
              where: { archive: false },
              required: false,
            },
            { model: Payment, required: false },
          ],
        });

        (sow as any).SowPaymentPlans = plans;
        (sow as any).Invoices        = invoices;
        return sow;
      })
    );

    return enriched;
  }

  async findSowById(id: string): Promise<Sow | null> {
    return await Sow.findOne({
      where: { id, archive: false },
    });
  }

  async findSowByUId(sowUId: string): Promise<Sow | null> {
    const sow = await Sow.findOne({
      where: { sowUId, archive: false },
    });
    if (!sow) return null;

    const allVersions = await Sow.findAll({
      where: { sowUId },
      attributes: ["id"],
    });
    const allSowIds = allVersions.map((v) => v.id);

    const plans = await SowPaymentPlan.findAll({
      where: { sowId: allSowIds, archive: false },
      include: [
        {
          model: SowPaymentPlanLineItem,
          as: "SowPaymentPlanLineItems",
          where: { archive: false },
          required: false,
        },
      ],
    });

    const invoices = await Invoice.findAll({
      where: { sowId: allSowIds, archive: false },
      include: [
        {
          model: InvoiceLineItem,
          as: "InvoiceLineItems",
          where: { archive: false },
          required: false,
        },
        { model: Payment, required: false },
      ],
    });

    (sow as any).SowPaymentPlans = plans;
    (sow as any).Invoices        = invoices;
    return sow;
  }

  async findSowByPONumber(customerPONumber: string): Promise<Sow | null> {
    return await Sow.findOne({
      where: { customerPONumber, archive: false },
    });
  }

  async findSowsByCustomerId(customerId: string): Promise<Sow[]> {
    return await Sow.findAll({
      where: { customerId, archive: false },
    });
  }

  async archiveSow(id: string): Promise<Sow> {
    const sow = await Sow.findOne({
      where: { id, archive: false },
    });
    if (!sow) throw { status: 404, message: "SOW not found" };
    sow.archive = true;
    return await sow.save();
  }
}

// ─── SOW PAYMENT PLAN DB SERVICE ─────────────────────────────────────────────

@injectable()
export class SowPaymentPlanDbService implements ISowPaymentPlanDbService {

  async createSowPaymentPlan(plan: SowPaymentPlan): Promise<SowPaymentPlan> {
    return await plan.save();
  }

  async findAllSowPaymentPlans(): Promise<SowPaymentPlan[]> {
    return await SowPaymentPlan.findAll({
      where: { archive: false },
      include: [
        {
          model: SowPaymentPlanLineItem,
          as: "SowPaymentPlanLineItems",
          where: { archive: false },
          required: false,
        },
        {
          model: Invoice,
          as: "Invoices",
          where: { archive: false },
          required: false,
          include: [
            {
              model: InvoiceLineItem,
              as: "InvoiceLineItems",
              where: { archive: false },
              required: false,
            },
            { model: Payment, required: false },
          ],
        },
        {
          model: Customer,
          where: { archive: false },
          required: false,
        },
        {
          model: Sow,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findSowPaymentPlanById(id: string): Promise<SowPaymentPlan | null> {
    return await SowPaymentPlan.findOne({
      where: { id, archive: false },
    });
  }

  async findSowPaymentPlanByUId(sowPaymentPlanUId: string): Promise<SowPaymentPlan | null> {
    return await SowPaymentPlan.findOne({
      where: { sowPaymentPlanUId, archive: false },
      include: [
        {
          model: SowPaymentPlanLineItem,
          as: "SowPaymentPlanLineItems",
          where: { archive: false },
          required: false,
        },
        {
          model: Invoice,
          as: "Invoices",
          where: { archive: false },
          required: false,
          include: [
            {
              model: InvoiceLineItem,
              as: "InvoiceLineItems",
              where: { archive: false },
              required: false,
            },
            { model: Payment, required: false },
          ],
        },
        {
          model: Customer,
          where: { archive: false },
          required: false,
        },
        {
          model: Sow,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findSowPaymentPlansBySowId(sowId: string): Promise<SowPaymentPlan[]> {
    return await SowPaymentPlan.findAll({
      where: { sowId, archive: false },
      include: [
        {
          model: SowPaymentPlanLineItem,
          as: "SowPaymentPlanLineItems",
          where: { archive: false },
          required: false,
        },
        {
          model: Invoice,
          as: "Invoices",
          where: { archive: false },
          required: false,
          include: [
            {
              model: InvoiceLineItem,
              as: "InvoiceLineItems",
              where: { archive: false },
              required: false,
            },
            { model: Payment, required: false },
          ],
        },
        {
          model: Customer,
          where: { archive: false },
          required: false,
        },
        {
          model: Sow,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findSowPaymentPlansByDate(date: string): Promise<SowPaymentPlan[]> {
    return await SowPaymentPlan.findAll({
      where: { plannedInvoiceDate: date, archive: false },
      include: [
        {
          model: SowPaymentPlanLineItem,
          as: "SowPaymentPlanLineItems",
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findSowPaymentPlansWithInvoices(): Promise<SowPaymentPlan[]> {
    return await SowPaymentPlan.findAll({
      where: { archive: false },
      include: [
        {
          model: Invoice,
          as: "Invoices",
          required: false,
          where: { archive: false },
        },
      ],
    });
  }

  async getTotalPlannedAmountBySowId(sowId: string): Promise<number> {
    const plans = await SowPaymentPlan.findAll({
      where: { sowId, archive: false },
    });
    return plans.reduce((sum, plan) => sum + plan.totalActualAmount, 0);
  }

  async archiveSowPaymentPlan(id: string): Promise<SowPaymentPlan> {
    const plan = await SowPaymentPlan.findOne({
      where: { id, archive: false },
    });
    if (!plan) throw { status: 404, message: "SOW Payment Plan not found" };
    plan.archive = true;
    return await plan.save();
  }
}

// ─── SOW PAYMENT PLAN LINE ITEM DB SERVICE ───────────────────────────────────

@injectable()
export class SowPaymentPlanLineItemDbService implements ISowPaymentPlanLineItemDbService {

  async createSowPaymentPlanLineItem(lineItem: SowPaymentPlanLineItem): Promise<SowPaymentPlanLineItem> {
    return await lineItem.save();
  }

  async findAllSowPaymentPlanLineItems(): Promise<SowPaymentPlanLineItem[]> {
    return await SowPaymentPlanLineItem.findAll({
      where: { archive: false },
      include: [
        {
          model: SowPaymentPlan,
          where: { archive: false },
          required: false,
        },
        {
          model: Sow,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async findSowPaymentPlanLineItemByUId(sowPaymentPlanLineItemUId: string): Promise<SowPaymentPlanLineItem | null> {
    return await SowPaymentPlanLineItem.findOne({
      where: { sowPaymentPlanLineItemUId, archive: false },
    });
  }

  async findSowPaymentPlanLineItemsByPlanId(sowPaymentPlanId: string): Promise<SowPaymentPlanLineItem[]> {
    return await SowPaymentPlanLineItem.findAll({
      where: { sowPaymentPlanId, archive: false },
      include: [
        {
          model: SowPaymentPlan,
          where: { archive: false },
          required: false,
        },
        {
          model: Sow,
          where: { archive: false },
          required: false,
        },
      ],
    });
  }

  async archiveSowPaymentPlanLineItem(id: string): Promise<SowPaymentPlanLineItem> {
    const lineItem = await SowPaymentPlanLineItem.findOne({
      where: { id, archive: false },
    });
    if (!lineItem) throw { status: 404, message: "SOW Payment Plan Line Item not found" };
    lineItem.archive = true;
    return await lineItem.save();
  }
}

// ─── INVOICE DB SERVICE ───────────────────────────────────────────────────────

@injectable()
export class InvoiceDbService implements IInvoiceDbService {

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    return await invoice.save();
  }

  async findAllInvoices(): Promise<Invoice[]> {
    return await Invoice.findAll({
      where: { archive: false },
      include: [
        {
          model: InvoiceLineItem,
          as: "InvoiceLineItems",
          where: { archive: false },
          required: false,
        },
        { model: Payment, required: false },
        {
          model: Customer,
          where: { archive: false },
          required: false,
          include: [
            {
              model: Organization,
              where: { archive: false },
              required: false,
            },
          ],
        },
        { model: Sow, where: { archive: false }, required: false },
      ],
    });
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    return await Invoice.findOne({
      where: { id, archive: false },
    });
  }

  async findInvoiceByUId(invoiceUId: string): Promise<Invoice | null> {
    return await Invoice.findOne({
      where: { invoiceUId, archive: false },
      include: [
        {
          model: InvoiceLineItem,
          as: "InvoiceLineItems",
          where: { archive: false },
          required: false,
        },
        { model: Payment, required: false },
        {
          model: Customer,
          where: { archive: false },
          required: false,
          include: [
            {
              model: Organization,
              where: { archive: false },
              required: false,
            },
          ],
        },
        { model: Sow, where: { archive: false }, required: false },
      ],
    });
  }

  async findInvoiceByIdWithLineItems(id: string): Promise<Invoice | null> {
    return await Invoice.findOne({
      where: { id, archive: false },
      include: [
        {
          model: InvoiceLineItem,
          as: "InvoiceLineItems",
          where: { archive: false },
          required: false,
        },
        { model: Payment, required: false },
        {
          model: Customer,
          where: { archive: false },
          required: false,
          include: [
            {
              model: Organization,
              where: { archive: false },
              required: false,
            },
          ],
        },
        { model: Sow, where: { archive: false }, required: false },
      ],
    });
  }

  async findInvoiceBySowPaymentPlanId(sowPaymentPlanId: string): Promise<Invoice | null> {
    return await Invoice.findOne({
      where: { sowPaymentPlanId, archive: false },
    });
  }

  async updateInvoiceStatus(id: string, status: "Drafted" | "Approved" | "Cancelled"): Promise<Invoice> {
    const invoice = await Invoice.findOne({
      where: { id, archive: false },
    });
    if (!invoice) throw { status: 404, message: "Invoice not found" };
    invoice.status = status;
    return await invoice.save();
  }

  async updateInvoicePayment(id: string, paymentId: string, paymentDate: Date): Promise<Invoice> {
    const invoice = await Invoice.findOne({
      where: { id, archive: false },
    });
    if (!invoice) throw { status: 404, message: "Invoice not found" };
    invoice.paymentId         = paymentId;
    invoice.paymentReceivedOn = paymentDate;
    return await invoice.save();
  }

  async archiveInvoice(id: string): Promise<Invoice> {
    const invoice = await Invoice.findOne({
      where: { id, archive: false },
    });
    if (!invoice) throw { status: 404, message: "Invoice not found" };
    invoice.archive = true;
    return await invoice.save();
  }
}

// INVOICE LINE ITEM DB SERVICE 

@injectable()
export class InvoiceLineItemDbService implements IInvoiceLineItemDbService {

  async createInvoiceLineItem(lineItem: InvoiceLineItem): Promise<InvoiceLineItem> {
    return await lineItem.save();
  }

  async findInvoiceLineItemByUId(invoiceLineItemUId: string): Promise<InvoiceLineItem | null> {
    return await InvoiceLineItem.findOne({
      where: { invoiceLineItemUId, archive: false },
    });
  }

  async findInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<InvoiceLineItem[]> {
    return await InvoiceLineItem.findAll({
      where: { invoiceId, archive: false },
    });
  }

  async archiveInvoiceLineItem(id: string): Promise<InvoiceLineItem> {
    const lineItem = await InvoiceLineItem.findOne({
      where: { id, archive: false },
    });
    if (!lineItem) throw { status: 404, message: "Invoice Line Item not found" };
    lineItem.archive = true;
    return await lineItem.save();
  }
}

//  PAYMENT DB SERVICE 

@injectable()
export class PaymentDbService implements IPaymentDbService {

  async createPayment(payment: Payment): Promise<Payment> {
    return await payment.save();
  }

  async findPaymentByUId(paymentUId: string): Promise<Payment | null> {
    return await Payment.findOne({
      where: { paymentUId, archive: false },
    });
  }

  async findPaymentByInvoiceId(invoiceId: string): Promise<Payment | null> {
    return await Payment.findOne({
      where: { invoiceId, archive: false },
    });
  }

  async archivePayment(id: string): Promise<Payment> {
    const payment = await Payment.findOne({
      where: { id, archive: false },
    });
    if (!payment) throw { status: 404, message: "Payment not found" };
    payment.archive = true;
    return await payment.save();
  }
}