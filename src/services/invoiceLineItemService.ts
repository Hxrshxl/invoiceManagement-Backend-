import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import { CreateInvoiceLineItemDto } from "../dto/createInvoiceLineItemDto";
import { IInvoiceLineItemDbService, IInvoiceDbService } from "../postgresDB/pgInterface";
import { IInvoiceLineItem } from "../interfaces/invoiceLineItemInterface";

@injectable()
class InvoiceLineItemService {
  constructor(
    @inject(TYPES.InvoiceLineItemDbService)
    private readonly invoiceLineItemDbService: IInvoiceLineItemDbService,

    @inject(TYPES.InvoiceDbService)
    private readonly invoiceDbService: IInvoiceDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createInvoiceLineItem(dto: CreateInvoiceLineItemDto): Promise<IInvoiceLineItem> {
    try {
      // Check invoice exists before creating line item
      const existingInvoice = await this.invoiceDbService.findInvoiceById(dto.invoiceId);
      if (!existingInvoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      // Map fields explicitly onto model instance
      const invoiceLineItem = new InvoiceLineItem();
      invoiceLineItem.invoiceId  = dto.invoiceId;
      invoiceLineItem.orderNo    = dto.orderNo;
      invoiceLineItem.particular = dto.particular;
      invoiceLineItem.rate       = dto.rate;
      invoiceLineItem.unit       = dto.unit;
      invoiceLineItem.total      = dto.total;

      // Save via DbService
      const created = await this.invoiceLineItemDbService.createInvoiceLineItem(invoiceLineItem);

      this.logger.info(`Invoice Line Item created successfully with id: ${created.id}`);

      return {
        id:         created.id,
        invoiceId:  created.invoiceId,
        orderNo:    created.orderNo,
        particular: created.particular,
        rate:       created.rate,
        unit:       created.unit,
        total:      created.total,
        createdAt:  created.createdAt,
        updatedAt:  created.updatedAt,
      };
    } catch (error: any) {
      this.logger.error("Error creating invoice line item", error);
      throw error.status ? error : { status: 500, message: "Failed to create invoice line item" };
    }
  }

  async getInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<IInvoiceLineItem[]> {
    try {
      // Check invoice exists before fetching line items
      const existingInvoice = await this.invoiceDbService.findInvoiceById(invoiceId);
      if (!existingInvoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      // Fetch all line items for this invoice via DbService
      const lineItems = await this.invoiceLineItemDbService.findInvoiceLineItemsByInvoiceId(invoiceId);

      if (!lineItems.length) {
        throw { status: 404, message: "No line items found for this invoice" };
      }

      this.logger.info(`Fetched ${lineItems.length} line items for invoiceId: ${invoiceId}`);

      return lineItems.map((lineItem) => ({
        id:         lineItem.id,
        invoiceId:  lineItem.invoiceId,
        orderNo:    lineItem.orderNo,
        particular: lineItem.particular,
        rate:       lineItem.rate,
        unit:       lineItem.unit,
        total:      lineItem.total,
        createdAt:  lineItem.createdAt,
        updatedAt:  lineItem.updatedAt,
      }));
    } catch (error: any) {
      this.logger.error(`Error fetching line items for invoiceId: ${invoiceId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice line items" };
    }
  }
}

export default InvoiceLineItemService;