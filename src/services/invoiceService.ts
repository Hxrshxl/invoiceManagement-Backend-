import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import { IInvoice } from "../interfaces/invoiceInterface";
import { IInvoiceLineItem } from "../interfaces/invoiceLineItemInterface";

@injectable()
class InvoiceService {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

async generateInvoicesForToday(date?: string): Promise<{ invoices: IInvoice[], skipped: number }> {
  try {
    const today = date || new Date().toISOString().split("T")[0];

    this.logger.info(`Generating invoices for date: ${today}`);

    const duePlans = await SowPaymentPlan.findAll({
      where: { plannedInvoiceDate: today },
      include: [
        {
          model: SowPaymentPlanLineItem,
          as: "SowPaymentPlanLineItems",
        },
      ],
    });

    if (!duePlans.length) {
      this.logger.warn(`No payment plans due today: ${today}`);
      return { invoices: [], skipped: 0 };
    }

    this.logger.info(`Found ${duePlans.length} payment plans due today`);

    const invoices: IInvoice[] = [];
    let skipped = 0;

    for (const plan of duePlans) {
      const existingInvoice = await Invoice.findOne({
        where: { sowPaymentPlanId: plan.id },
      });

      if (existingInvoice) {
        this.logger.warn(`Invoice already exists for sowPaymentPlanId: ${plan.id} — skipping`);
        skipped++;
        continue;
      }

      const invoice = new Invoice();
      invoice.sowId             = plan.sowId;
      invoice.customerId        = plan.customerId;
      invoice.sowPaymentPlanId  = plan.id!;
      invoice.status            = "Drafted";
      invoice.totalInvoiceValue = plan.totalActualAmount;
      invoice.invoiceAmount     = plan.totalActualAmount;
      invoice.invoiceTaxAmount  = 0;
      invoice.invoiceVersionNo  = 1;

      const createdInvoice = await invoice.save();

      this.logger.info(`Invoice created with id: ${createdInvoice.id} for plan: ${plan.id}`);

      const lineItems = (plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[];

      for (const lineItem of lineItems) {
        const invoiceLineItem = new InvoiceLineItem();
        invoiceLineItem.invoiceId  = createdInvoice.id!;
        invoiceLineItem.orderNo    = lineItem.orderId;
        invoiceLineItem.particular = lineItem.particular;
        invoiceLineItem.rate       = lineItem.rate;
        invoiceLineItem.unit       = lineItem.unit;
        invoiceLineItem.total      = lineItem.total;

        await invoiceLineItem.save();

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
      const invoices = await Invoice.findAll();

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
      const invoice = await Invoice.findByPk(id, {
        include: [
          {
            model: InvoiceLineItem,
            as: "InvoiceLineItems",
          },
        ],
      });

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

  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
  try {
    const invoice = await Invoice.findByPk(invoiceId, {
      include: [
        {
          model: InvoiceLineItem,
          as: "InvoiceLineItems",
        },
      ],
    });

    if (!invoice) {
      throw { status: 404, message: "Invoice not found" };
    }

    const lineItems = (invoice as any).InvoiceLineItems as InvoiceLineItem[];

    return new Promise((resolve, reject) => {
      const PDFDocument = require("pdfkit");
      const doc         = new PDFDocument({ margin: 50 });
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
    this.logger.error(`Error generating PDF for invoiceId: ${invoiceId}`, error);
    throw error.status ? error : { status: 500, message: "Failed to generate invoice PDF" };
  }
}

  async approveInvoice(id: string): Promise<IInvoice> {
    try {
      const invoice = await Invoice.findByPk(id);

      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      if (invoice.status === "Approved") {
        throw { status: 409, message: "Invoice is already approved" };
      }

      if (invoice.status === "Cancelled") {
        throw { status: 409, message: "Cannot approve a cancelled invoice" };
      }

      invoice.status = "Approved";
      const updated = await invoice.save();

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
      const invoice = await Invoice.findByPk(id);

      if (!invoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      if (invoice.status === "Cancelled") {
        throw { status: 409, message: "Invoice is already cancelled" };
      }

      if (invoice.status === "Approved") {
        throw { status: 409, message: "Cannot cancel an approved invoice" };
      }

      invoice.status = "Cancelled";
      const updated = await invoice.save();

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
}

export default InvoiceService;