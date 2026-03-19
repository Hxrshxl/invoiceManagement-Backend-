import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import Payment from "../models/paymentModel";
import Customer from "../models/customerModel";
import Organization from "../models/organizationModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import { IInvoice } from "../interfaces/invoiceInterface";
import { UpdateInvoiceDto } from "../dto/updateInvoiceDto";
import {
  IInvoiceDbService,
  IInvoiceLineItemDbService,
  ISowPaymentPlanDbService,
} from "../postgresDB/pgInterface";

@injectable()
class InvoiceService {
  constructor(
    @inject(TYPES.InvoiceDbService)
    private readonly invoiceDbService: IInvoiceDbService,

    @inject(TYPES.InvoiceLineItemDbService)
    private readonly invoiceLineItemDbService: IInvoiceLineItemDbService,

    @inject(TYPES.SowPaymentPlanDbService)
    private readonly sowPaymentPlanDbService: ISowPaymentPlanDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async generateInvoicesForToday(date?: string): Promise<{ invoices: IInvoice[], skipped: number }> {
    try {
      let today: string;
      if (date) {
        today = date;
      } else {
        const now   = new Date();
        const year  = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day   = String(now.getDate()).padStart(2, "0");
        today       = `${year}-${month}-${day}`;
      }

      this.logger.info(`Generating invoices for date: ${today}`);

      const duePlans = await this.sowPaymentPlanDbService.findSowPaymentPlansByDate(today);

      if (!duePlans.length) {
        this.logger.warn(`No payment plans due today: ${today}`);
        return { invoices: [], skipped: 0 };
      }

      this.logger.info(`Found ${duePlans.length} payment plans due today`);

      const invoices: IInvoice[] = [];
      let skipped = 0;

      for (const plan of duePlans) {
        const existingInvoice = await this.invoiceDbService.findInvoiceBySowPaymentPlanId(plan.id!);
        if (existingInvoice) {
          this.logger.warn(`Invoice already exists for sowPaymentPlanId: ${plan.id} — skipping`);
          skipped++;
          continue;
        }

        const invoice               = new Invoice();
        invoice.sowId               = plan.sowId;
        invoice.customerId          = plan.customerId;
        invoice.sowPaymentPlanId    = plan.id!;
        invoice.status              = "Drafted";
        invoice.totalInvoiceValue   = plan.totalActualAmount;
        invoice.invoiceAmount       = plan.totalActualAmount;
        invoice.invoiceTaxAmount    = 0;
        invoice.invoiceVersionNo    = 1;
        invoice.version             = 1;
        invoice.archive             = false;

        const createdInvoice = await this.invoiceDbService.createInvoice(invoice);
        this.logger.info(`Invoice created with id: ${createdInvoice.id} for plan: ${plan.id}`);

        const lineItems = (plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[];

        for (const lineItem of lineItems) {
          const invoiceLineItem            = new InvoiceLineItem();
          invoiceLineItem.invoiceId        = createdInvoice.id!;
          invoiceLineItem.orderNo          = lineItem.orderId;
          invoiceLineItem.particular       = lineItem.particular;
          invoiceLineItem.rate             = lineItem.rate;
          invoiceLineItem.unit             = lineItem.unit;
          invoiceLineItem.total            = lineItem.total;
          invoiceLineItem.version          = 1;
          invoiceLineItem.archive          = false;

          await this.invoiceLineItemDbService.createInvoiceLineItem(invoiceLineItem);
        }

        invoices.push({
          id:                createdInvoice.id,
          invoiceUId:        createdInvoice.invoiceUId,
          status:            createdInvoice.status,
          totalInvoiceValue: createdInvoice.totalInvoiceValue,
          invoiceAmount:     createdInvoice.invoiceAmount,
          paymentReceivedOn: createdInvoice.paymentReceivedOn,
          InvoiceLineItems:  [],
          Payment:           null,
        } as any);
      }

      this.logger.info(`Generated ${invoices.length} invoices, skipped ${skipped}`);
      return { invoices, skipped };
    } catch (error: any) {
      this.logger.error("Error generating invoices for today", error);
      throw error.status ? error : { status: 500, message: "Failed to generate invoices" };
    }
  }

  async getAllInvoices(): Promise<IInvoice[]> {
    try {
      const invoices = await this.invoiceDbService.findAllInvoices();
      this.logger.info(`Fetched ${invoices.length} invoices`);

      return invoices.map((invoice) => {
        const lineItems    = ((invoice as any).InvoiceLineItems as InvoiceLineItem[]) ?? [];
        const payment      = (invoice as any).Payment as Payment | null;
        const customer     = (invoice as any).Customer as Customer | null;
        const organization = customer ? (customer as any).Organization as Organization | null : null;

        return {
          id:                invoice.id,
          invoiceUId:        invoice.invoiceUId,
          status:            invoice.status,
          totalInvoiceValue: invoice.totalInvoiceValue,
          invoiceAmount:     invoice.invoiceAmount,
          paymentReceivedOn: invoice.paymentReceivedOn,
          organizationName:  organization?.legalOrganizationName ?? null,
          customerName:      customer?.legalName                 ?? null,
          InvoiceLineItems: lineItems.map((li) => ({
            orderNo:    li.orderNo,
            particular: li.particular,
            rate:       li.rate,
            unit:       li.unit,
            total:      li.total,
          })),
          Payment: payment ? {
            paymentDate:   payment.paymentDate,
            isFullPayment: payment.isFullPayment,
            bankPayment:   payment.bankPayment,
          } : null,
        } as any;
      });
    } catch (error: any) {
      this.logger.error("Error fetching invoices", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoices" };
    }
  }

  async getInvoiceById(invoiceUId: string): Promise<IInvoice> {
    try {
      const invoice = await this.invoiceDbService.findInvoiceByUId(invoiceUId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }
      this.logger.info(`Fetched invoice with UId: ${invoiceUId}`);

      const lineItems    = ((invoice as any).InvoiceLineItems as InvoiceLineItem[]) ?? [];
      const payment      = (invoice as any).Payment as Payment | null;
      const customer     = (invoice as any).Customer as Customer | null;
      const organization = customer ? (customer as any).Organization as Organization | null : null;

      return {
        id:                invoice.id,
        invoiceUId:        invoice.invoiceUId,
        status:            invoice.status,
        totalInvoiceValue: invoice.totalInvoiceValue,
        invoiceAmount:     invoice.invoiceAmount,
        paymentReceivedOn: invoice.paymentReceivedOn,
        organizationName:  organization?.legalOrganizationName ?? null,
        customerName:      customer?.legalName                 ?? null,
        InvoiceLineItems: lineItems.map((li) => ({
          orderNo:    li.orderNo,
          particular: li.particular,
          rate:       li.rate,
          unit:       li.unit,
          total:      li.total,
        })),
        Payment: payment ? {
          paymentDate:   payment.paymentDate,
          isFullPayment: payment.isFullPayment,
          bankPayment:   payment.bankPayment,
        } : null,
      } as any;
    } catch (error: any) {
      this.logger.error(`Error fetching invoice with UId: ${invoiceUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice" };
    }
  }

  async approveInvoice(invoiceUId: string): Promise<IInvoice> {
    try {
      const invoice = await this.invoiceDbService.findInvoiceByUId(invoiceUId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }
      if (invoice.status === "Approved") {
        throw { status: 409, message: "Invoice is already approved" };
      }
      if (invoice.status === "Cancelled") {
        throw { status: 409, message: "Cannot approve a cancelled invoice" };
      }

      const updated = await this.invoiceDbService.updateInvoiceStatus(invoice.id!, "Approved");
      this.logger.info(`Invoice approved with UId: ${invoiceUId}`);

      return {
        id:                updated.id,
        invoiceUId:        updated.invoiceUId,
        status:            updated.status,
        totalInvoiceValue: updated.totalInvoiceValue,
        invoiceAmount:     updated.invoiceAmount,
        paymentReceivedOn: updated.paymentReceivedOn,
        InvoiceLineItems:  [],
        Payment:           null,
      } as any;
    } catch (error: any) {
      this.logger.error(`Error approving invoice with UId: ${invoiceUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to approve invoice" };
    }
  }

  async cancelInvoice(invoiceUId: string): Promise<IInvoice> {
    try {
      const invoice = await this.invoiceDbService.findInvoiceByUId(invoiceUId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }
      if (invoice.status === "Cancelled") {
        throw { status: 409, message: "Invoice is already cancelled" };
      }
      if (invoice.status === "Approved") {
        throw { status: 409, message: "Cannot cancel an approved invoice" };
      }

      const updated = await this.invoiceDbService.updateInvoiceStatus(invoice.id!, "Cancelled");
      this.logger.info(`Invoice cancelled with UId: ${invoiceUId}`);

      return {
        id:                updated.id,
        invoiceUId:        updated.invoiceUId,
        status:            updated.status,
        totalInvoiceValue: updated.totalInvoiceValue,
        invoiceAmount:     updated.invoiceAmount,
        paymentReceivedOn: updated.paymentReceivedOn,
        InvoiceLineItems:  [],
        Payment:           null,
      } as any;
    } catch (error: any) {
      this.logger.error(`Error cancelling invoice with UId: ${invoiceUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to cancel invoice" };
    }
  }

  // async updateInvoice(dto: UpdateInvoiceDto): Promise<IInvoice> {
  //   try {
  //     const existing = await this.invoiceDbService.findInvoiceByUId(dto.invoiceUId);
  //     if (!existing) {
  //       throw { status: 404, message: "Invoice not found" };
  //     }

  //     await this.invoiceDbService.archiveInvoice(existing.id!);

  //     const updated               = new Invoice();
  //     updated.invoiceUId          = existing.invoiceUId;
  //     updated.version             = existing.version + 1;
  //     updated.archive             = false;
  //     updated.sowId               = existing.sowId;
  //     updated.sowPaymentPlanId    = existing.sowPaymentPlanId;
  //     updated.customerId          = existing.customerId;
  //     updated.status              = dto.status            ?? existing.status;
  //     updated.totalInvoiceValue   = dto.totalInvoiceValue ?? existing.totalInvoiceValue;
  //     updated.invoiceAmount       = dto.invoiceAmount     ?? existing.invoiceAmount;
  //     updated.invoiceTaxAmount    = dto.invoiceTaxAmount  ?? existing.invoiceTaxAmount;
  //     updated.invoiceVersionNo    = dto.invoiceVersionNo  ?? existing.invoiceVersionNo;
  //     updated.invoiceSentOn       = existing.invoiceSentOn;
  //     updated.paymentReceivedOn   = existing.paymentReceivedOn;
  //     updated.paymentId           = existing.paymentId;

  //     const created = await this.invoiceDbService.createInvoice(updated);
  //     this.logger.info(`Invoice updated with UId: ${dto.invoiceUId} version: ${created.version}`);

  //     return {
  //       id:                created.id,
  //       invoiceUId:        created.invoiceUId,
  //       status:            created.status,
  //       totalInvoiceValue: created.totalInvoiceValue,
  //       invoiceAmount:     created.invoiceAmount,
  //       paymentReceivedOn: created.paymentReceivedOn,
  //       InvoiceLineItems:  [],
  //       Payment:           null,
  //     } as any;
  //   } catch (error: any) {
  //     this.logger.error("Error updating invoice", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update invoice" };
  //   }
  // }

  // async deleteInvoice(invoiceUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.invoiceDbService.findInvoiceByUId(invoiceUId);
  //     if (!existing) {
  //       throw { status: 404, message: "Invoice not found" };
  //     }
  //     await this.invoiceDbService.archiveInvoice(existing.id!);
  //     this.logger.info(`Invoice deleted with UId: ${invoiceUId}`);
  //     return { message: "Invoice deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting invoice", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete invoice" };
  //   }
  // }

  async generateInvoicePdf(invoiceUId: string): Promise<Buffer> {
    try {
      const invoice = await this.invoiceDbService.findInvoiceByUId(invoiceUId);
      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      const lineItems    = ((invoice as any).InvoiceLineItems as InvoiceLineItem[]) ?? [];
      const customer     = (invoice as any).Customer as Customer | null;
      const organization = customer ? (customer as any).Organization as Organization | null : null;

      return new Promise((resolve, reject) => {
        const PDFDocument       = require("pdfkit");
        const doc               = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", reject);

        doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", { align: "center" });
        doc.moveDown();
        doc.fontSize(10).font("Helvetica");
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold").text("Invoice Details", { underline: true });
        doc.moveDown(0.5);
        doc.font("Helvetica");
        doc.text(`Invoice UId      : ${invoice.invoiceUId}`);
        doc.text(`Organization     : ${organization?.legalOrganizationName ?? "N/A"}`);
        doc.text(`Customer         : ${customer?.legalName ?? "N/A"}`);
        doc.text(`Status           : ${invoice.status}`);
        doc.text(`Invoice Amount   : $${invoice.invoiceAmount}`);
        doc.text(`Tax Amount       : $${invoice.invoiceTaxAmount}`);
        doc.text(`Total Value      : $${invoice.totalInvoiceValue}`);
        doc.text(`Payment Received : ${invoice.paymentReceivedOn ?? "N/A"}`);
        doc.text(`Created At       : ${invoice.createdAt}`);

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold").text("Line Items", { underline: true });
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold");
        doc.text("Order No",   50,  doc.y, { width: 100 });
        doc.text("Particular", 150, doc.y - doc.currentLineHeight(), { width: 200 });
        doc.text("Rate",       350, doc.y - doc.currentLineHeight(), { width: 70 });
        doc.text("Unit",       420, doc.y - doc.currentLineHeight(), { width: 50 });
        doc.text("Total",      470, doc.y - doc.currentLineHeight(), { width: 80 });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);

        doc.font("Helvetica");
        let runningTotal = 0;

        for (const item of lineItems) {
          const y = doc.y;
          doc.text(item.orderNo,    50,  y, { width: 100 });
          doc.text(item.particular, 150, y, { width: 200 });
          doc.text(`$${item.rate}`, 350, y, { width: 70 });
          doc.text(`${item.unit}`,  420, y, { width: 50 });
          doc.text(`$${item.total}`,470, y, { width: 80 });
          doc.moveDown(0.8);
          runningTotal += item.total;
        }

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.font("Helvetica-Bold");
        doc.text(`Grand Total : $${runningTotal}`, { align: "right" });

        doc.moveDown();
        doc.fontSize(8).font("Helvetica").fillColor("gray");
        doc.text("Generated by CentraAPIs Invoice Management System", { align: "center" });

        doc.end();
      });
    } catch (error: any) {
      this.logger.error(`Error generating PDF for invoiceUId: ${invoiceUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to generate invoice PDF" };
    }
  }
}

export default InvoiceService;