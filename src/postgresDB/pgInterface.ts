import Organization from "../models/organizationModel";
import Customer from "../models/customerModel";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import Payment from "../models/paymentModel";

// ─── ORGANIZATION ─────────────────────────────────────────────────────────────
export interface IOrganizationDbService {
  createOrganization(organization: Organization): Promise<Organization>;
  findAllOrganizations(): Promise<Organization[]>;
  findOrganizationById(id: string): Promise<Organization | null>;
  findOrganizationByUId(organizationUId: string): Promise<Organization | null>;
  findOrganizationByEmail(email: string): Promise<Organization | null>;
  archiveOrganization(id: string): Promise<Organization>;
}

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────
export interface ICustomerDbService {
  createCustomer(customer: Customer): Promise<Customer>;
  findAllCustomers(): Promise<Customer[]>;
  findCustomerById(id: string): Promise<Customer | null>;
  findCustomerByUId(customerUId: string): Promise<Customer | null>;
  findCustomerByLegalName(legalName: string): Promise<Customer | null>;
  findCustomersByOrganizationId(organizationId: string): Promise<Customer[]>;
  archiveCustomer(id: string): Promise<Customer>;
}

// ─── SOW ──────────────────────────────────────────────────────────────────────
export interface ISowDbService {
  createSow(sow: Sow): Promise<Sow>;
  findAllSows(): Promise<Sow[]>;
  findSowById(id: string): Promise<Sow | null>;
  findSowByUId(sowUId: string): Promise<Sow | null>;
  findSowByPONumber(customerPONumber: string): Promise<Sow | null>;
  findSowsByCustomerId(customerId: string): Promise<Sow[]>;
  archiveSow(id: string): Promise<Sow>;
}

// ─── SOW PAYMENT PLAN ─────────────────────────────────────────────────────────
export interface ISowPaymentPlanDbService {
  createSowPaymentPlan(plan: SowPaymentPlan): Promise<SowPaymentPlan>;
  findAllSowPaymentPlans(): Promise<SowPaymentPlan[]>;
  findSowPaymentPlanById(id: string): Promise<SowPaymentPlan | null>;
  findSowPaymentPlanByUId(sowPaymentPlanUId: string): Promise<SowPaymentPlan | null>;
  findSowPaymentPlansBySowId(sowId: string): Promise<SowPaymentPlan[]>;
  findSowPaymentPlansByDate(date: string): Promise<SowPaymentPlan[]>;
  findSowPaymentPlansWithInvoices(): Promise<SowPaymentPlan[]>;
  getTotalPlannedAmountBySowId(sowId: string): Promise<number>;
  archiveSowPaymentPlan(id: string): Promise<SowPaymentPlan>;
}

// ─── SOW PAYMENT PLAN LINE ITEM ───────────────────────────────────────────────
export interface ISowPaymentPlanLineItemDbService {
  createSowPaymentPlanLineItem(lineItem: SowPaymentPlanLineItem): Promise<SowPaymentPlanLineItem>;
  findAllSowPaymentPlanLineItems(): Promise<SowPaymentPlanLineItem[]>;
  findSowPaymentPlanLineItemByUId(sowPaymentPlanLineItemUId: string): Promise<SowPaymentPlanLineItem | null>;
  findSowPaymentPlanLineItemsByPlanId(sowPaymentPlanId: string): Promise<SowPaymentPlanLineItem[]>;
  archiveSowPaymentPlanLineItem(id: string): Promise<SowPaymentPlanLineItem>;
}

// ─── INVOICE ──────────────────────────────────────────────────────────────────
export interface IInvoiceDbService {
  createInvoice(invoice: Invoice): Promise<Invoice>;
  findAllInvoices(): Promise<Invoice[]>;
  findInvoiceById(id: string): Promise<Invoice | null>;
  findInvoiceByUId(invoiceUId: string): Promise<Invoice | null>;
  findInvoiceByIdWithLineItems(id: string): Promise<Invoice | null>;
  findInvoiceBySowPaymentPlanId(sowPaymentPlanId: string): Promise<Invoice | null>;
  updateInvoiceStatus(id: string, status: "Drafted" | "Approved" | "Cancelled"): Promise<Invoice>;
  updateInvoicePayment(id: string, paymentId: string, paymentDate: Date): Promise<Invoice>;
  archiveInvoice(id: string): Promise<Invoice>;
}

// ─── INVOICE LINE ITEM ────────────────────────────────────────────────────────
export interface IInvoiceLineItemDbService {
  createInvoiceLineItem(lineItem: InvoiceLineItem): Promise<InvoiceLineItem>;
  findInvoiceLineItemByUId(invoiceLineItemUId: string): Promise<InvoiceLineItem | null>;
  findInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<InvoiceLineItem[]>;
  archiveInvoiceLineItem(id: string): Promise<InvoiceLineItem>;
}

// ─── PAYMENT ──────────────────────────────────────────────────────────────────
export interface IPaymentDbService {
  createPayment(payment: Payment): Promise<Payment>;
  findPaymentByUId(paymentUId: string): Promise<Payment | null>;
  findPaymentByInvoiceId(invoiceId: string): Promise<Payment | null>;
  archivePayment(id: string): Promise<Payment>;
}