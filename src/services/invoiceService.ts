import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import {
  IInvoiceDbService,
  IInvoiceLineItemDbService,
  ISowPaymentPlanDbService,
} from "../postgresDB/pgInterface";
import { IInvoice } from "../interfaces/invoiceInterface";

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
      // Use provided date or default to today
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

      // Fetch all plans due on this date with line items included via DbService
      const duePlans = await this.sowPaymentPlanDbService.findSowPaymentPlansByDate(today);

      if (!duePlans.length) {
        this.logger.warn(`No payment plans due today: ${today}`);
        return { invoices: [], skipped: 0 };
      }

      this.logger.info(`Found ${duePlans.length} payment plans due today`);

      const invoices: IInvoice[] = [];
      let skipped = 0;

      for (const plan of duePlans) {
        // Check if invoice already exists for this plan
        const existingInvoice = await this.invoiceDbService.findInvoiceBySowPaymentPlanId(plan.id!);

        if (existingInvoice) {
          this.logger.warn(`Invoice already exists for sowPaymentPlanId: ${plan.id} — skipping`);
          skipped++;
          continue;
        }

        // Create new invoice
        const invoice = new Invoice();
        invoice.sowId             = plan.sowId;
        invoice.customerId        = plan.customerId;
        invoice.sowPaymentPlanId  = plan.id!;
        invoice.status            = "Drafted";
        invoice.totalInvoiceValue = plan.totalActualAmount;
        invoice.invoiceAmount     = plan.totalActualAmount;
        invoice.invoiceTaxAmount  = 0;
        invoice.invoiceVersionNo  = 1;

        // Save via DbService
        const createdInvoice = await this.invoiceDbService.createInvoice(invoice);

        this.logger.info(`Invoice created with id: ${createdInvoice.id} for plan: ${plan.id}`);

        // Get line items from the included association
        const lineItems = (plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[];

        // Copy each line item from plan to invoice
        for (const lineItem of lineItems) {
          const invoiceLineItem = new InvoiceLineItem();
          invoiceLineItem.invoiceId  = createdInvoice.id!;
          invoiceLineItem.orderNo    = lineItem.orderId;
          invoiceLineItem.particular = lineItem.particular;
          invoiceLineItem.rate       = lineItem.rate;
          invoiceLineItem.unit       = lineItem.unit;
          invoiceLineItem.total      = lineItem.total;

          await this.invoiceLineItemDbService.createInvoiceLineItem(invoiceLineItem);

          this.logger.info(`Invoice line item created for invoiceId: ${createdInvoice.id}`);
        }

        invoices.push({
          id:                createdInvoice.id,
          sowId:             createdInvoice.sowId,
          sowPaymentPlanId:  createdInvoice.sowPaymentPlanId,
          customerId:        createdInvoice.customerId,
          status:            createdInvoice.status,
          totalInvoiceValue: createdInvoice.totalInvoiceValue,
          invoiceAmount:     createdInvoice.invoiceAmount,
          invoiceTaxAmount:  createdInvoice.invoiceTaxAmount,
          invoiceVersionNo:  createdInvoice.invoiceVersionNo,
          createdAt:         createdInvoice.createdAt,
          updatedAt:         createdInvoice.updatedAt,
        });
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

      return invoices.map((invoice) => ({
        id:                invoice.id,
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
      }));
    } catch (error: any) {
      this.logger.error("Error fetching invoices", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoices" };
    }
  }

  async getInvoiceById(id: string): Promise<IInvoice> {
    try {
      // Fetch invoice with line items included via DbService
      const invoice = await this.invoiceDbService.findInvoiceByIdWithLineItems(id);

      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      this.logger.info(`Fetched invoice with id: ${id}`);

      return {
        id:                invoice.id,
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
    } catch (error: any) {
      this.logger.error(`Error fetching invoice with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice" };
    }
  }

  async approveInvoice(id: string): Promise<IInvoice> {
    try {
      // Fetch invoice to check current status
      const invoice = await this.invoiceDbService.findInvoiceById(id);

      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      if (invoice.status === "Approved") {
        throw { status: 409, message: "Invoice is already approved" };
      }

      if (invoice.status === "Cancelled") {
        throw { status: 409, message: "Cannot approve a cancelled invoice" };
      }

      // Update status via DbService
      const updated = await this.invoiceDbService.updateInvoiceStatus(id, "Approved");

      this.logger.info(`Invoice approved with id: ${id}`);

      return {
        id:                updated.id,
        sowId:             updated.sowId,
        sowPaymentPlanId:  updated.sowPaymentPlanId,
        customerId:        updated.customerId,
        status:            updated.status,
        totalInvoiceValue: updated.totalInvoiceValue,
        invoiceAmount:     updated.invoiceAmount,
        invoiceTaxAmount:  updated.invoiceTaxAmount,
        invoiceSentOn:     updated.invoiceSentOn,
        paymentReceivedOn: updated.paymentReceivedOn,
        invoiceVersionNo:  updated.invoiceVersionNo,
        paymentId:         updated.paymentId,
        createdAt:         updated.createdAt,
        updatedAt:         updated.updatedAt,
      };
    } catch (error: any) {
      this.logger.error(`Error approving invoice with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to approve invoice" };
    }
  }

  async cancelInvoice(id: string): Promise<IInvoice> {
    try {
      // Fetch invoice to check current status
      const invoice = await this.invoiceDbService.findInvoiceById(id);

      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      if (invoice.status === "Cancelled") {
        throw { status: 409, message: "Invoice is already cancelled" };
      }

      if (invoice.status === "Approved") {
        throw { status: 409, message: "Cannot cancel an approved invoice" };
      }

      // Update status via DbService
      const updated = await this.invoiceDbService.updateInvoiceStatus(id, "Cancelled");

      this.logger.info(`Invoice cancelled with id: ${id}`);

      return {
        id:                updated.id,
        sowId:             updated.sowId,
        sowPaymentPlanId:  updated.sowPaymentPlanId,
        customerId:        updated.customerId,
        status:            updated.status,
        totalInvoiceValue: updated.totalInvoiceValue,
        invoiceAmount:     updated.invoiceAmount,
        invoiceTaxAmount:  updated.invoiceTaxAmount,
        invoiceSentOn:     updated.invoiceSentOn,
        paymentReceivedOn: updated.paymentReceivedOn,
        invoiceVersionNo:  updated.invoiceVersionNo,
        paymentId:         updated.paymentId,
        createdAt:         updated.createdAt,
        updatedAt:         updated.updatedAt,
      };
    } catch (error: any) {
      this.logger.error(`Error cancelling invoice with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to cancel invoice" };
    }
  }

  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
    try {
      // Fetch invoice with line items included via DbService
      const invoice = await this.invoiceDbService.findInvoiceByIdWithLineItems(invoiceId);

      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      // Extract line items from the included association
      const lineItems = (invoice as any).InvoiceLineItems as InvoiceLineItem[];

      // PDFKit works with streams so we wrap it in a Promise
      return new Promise((resolve, reject) => {
        const PDFDocument       = require("pdfkit");
        const doc               = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Collect all PDF chunks into buffer array
        doc.on("data", (chunk: Buffer) => buffers.push(chunk));

        // Merge all chunks and resolve when PDF is complete
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        // Reject promise if error occurs
        doc.on("error", reject);

        // ─── HEADER ─────────────────────────────────────────────
        doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", { align: "center" });
        doc.moveDown();

        doc.fontSize(10).font("Helvetica");
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // ─── INVOICE DETAILS ────────────────────────────────────
        doc.font("Helvetica-Bold").text("Invoice Details", { underline: true });
        doc.moveDown(0.5);

        doc.font("Helvetica");
        doc.text(`Invoice ID      : ${invoice.id}`);
        doc.text(`SOW ID          : ${invoice.sowId}`);
        doc.text(`Customer ID     : ${invoice.customerId}`);
        doc.text(`Status          : ${invoice.status}`);
        doc.text(`Invoice Amount  : $${invoice.invoiceAmount}`);
        doc.text(`Tax Amount      : $${invoice.invoiceTaxAmount}`);
        doc.text(`Total Value     : $${invoice.totalInvoiceValue}`);
        doc.text(`Version No      : ${invoice.invoiceVersionNo}`);
        doc.text(`Created At      : ${invoice.createdAt}`);

        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // ─── LINE ITEMS TABLE ────────────────────────────────────
        doc.font("Helvetica-Bold").text("Line Items", { underline: true });
        doc.moveDown(0.5);

        // Table header row
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

        // Print each line item row — track y position manually for columns
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

        // ─── GRAND TOTAL ─────────────────────────────────────────
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        doc.font("Helvetica-Bold");
        doc.text(`Grand Total : $${runningTotal}`, { align: "right" });

        // ─── FOOTER ──────────────────────────────────────────────
        doc.moveDown();
        doc.fontSize(8).font("Helvetica").fillColor("gray");
        doc.text("Generated by CentraAPIs Invoice Management System", { align: "center" });

        // Signal PDFKit that we are done — triggers 'end' event
        doc.end();
      });
    } catch (error: any) {
      this.logger.error(`Error generating PDF for invoiceId: ${invoiceId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to generate invoice PDF" };
    }
  }
}

export default InvoiceService;