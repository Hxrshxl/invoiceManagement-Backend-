import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import { CreateInvoiceLineItemDto } from "../dto/createInvoiceLineItemDto";
import { UpdateInvoiceLineItemDto } from "../dto/updateInvoiceLineItemDto";
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

  private mapToInterface(lineItem: InvoiceLineItem): IInvoiceLineItem {
    return {
      id:                 lineItem.id,
      invoiceLineItemUId: lineItem.invoiceLineItemUId,
      version:            lineItem.version,
      archive:            lineItem.archive,
      invoiceId:          lineItem.invoiceId,
      orderNo:            lineItem.orderNo,
      particular:         lineItem.particular,
      rate:               lineItem.rate,
      unit:               lineItem.unit,
      total:              lineItem.total,
      createdAt:          lineItem.createdAt,
      updatedAt:          lineItem.updatedAt,
    };
  }

  async createInvoiceLineItem(dto: CreateInvoiceLineItemDto): Promise<IInvoiceLineItem> {
    try {
      const existingInvoice = await this.invoiceDbService.findInvoiceById(dto.invoiceId);
      if (!existingInvoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      const invoiceLineItem = new InvoiceLineItem();
      invoiceLineItem.invoiceId  = dto.invoiceId;
      invoiceLineItem.orderNo    = dto.orderNo;
      invoiceLineItem.particular = dto.particular;
      invoiceLineItem.rate       = dto.rate;
      invoiceLineItem.unit       = dto.unit;
      invoiceLineItem.total      = dto.total;
      invoiceLineItem.version    = 1;
      invoiceLineItem.archive    = false;

      const created = await this.invoiceLineItemDbService.createInvoiceLineItem(invoiceLineItem);
      this.logger.info(`Invoice Line Item created with id: ${created.id}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating invoice line item", error);
      throw error.status ? error : { status: 500, message: "Failed to create invoice line item" };
    }
  }

  async getInvoiceLineItemsByInvoiceId(invoiceId: string): Promise<IInvoiceLineItem[]> {
    try {
      const existingInvoice = await this.invoiceDbService.findInvoiceById(invoiceId);
      if (!existingInvoice) {
        throw { status: 404, message: "Invoice not found" };
      }

      const lineItems = await this.invoiceLineItemDbService.findInvoiceLineItemsByInvoiceId(invoiceId);
      if (!lineItems.length) {
        throw { status: 404, message: "No line items found for this invoice" };
      }

      this.logger.info(`Fetched ${lineItems.length} line items for invoiceId: ${invoiceId}`);
      return lineItems.map((l) => this.mapToInterface(l));
    } catch (error: any) {
      this.logger.error(`Error fetching line items for invoiceId: ${invoiceId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice line items" };
    }
  }

  async updateInvoiceLineItem(dto: UpdateInvoiceLineItemDto): Promise<IInvoiceLineItem> {
    try {
      const existing = await this.invoiceLineItemDbService.findInvoiceLineItemByUId(dto.invoiceLineItemUId);
      if (!existing) {
        throw { status: 404, message: "Invoice Line Item not found" };
      }

      // Archive old version
      await this.invoiceLineItemDbService.archiveInvoiceLineItem(existing.id!);

      // Create new version with updated fields
      const updated = new InvoiceLineItem();
      updated.invoiceLineItemUId = existing.invoiceLineItemUId;
      updated.version            = existing.version + 1;
      updated.archive            = false;
      updated.invoiceId          = existing.invoiceId;
      updated.orderNo            = dto.orderNo    ?? existing.orderNo;
      updated.particular         = dto.particular ?? existing.particular;
      updated.rate               = dto.rate       ?? existing.rate;
      updated.unit               = dto.unit       ?? existing.unit;
      updated.total              = dto.total      ?? existing.total;

      const created = await this.invoiceLineItemDbService.createInvoiceLineItem(updated);
      this.logger.info(`Invoice Line Item updated with UId: ${dto.invoiceLineItemUId} version: ${created.version}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error updating invoice line item", error);
      throw error.status ? error : { status: 500, message: "Failed to update invoice line item" };
    }
  }

  async deleteInvoiceLineItem(invoiceLineItemUId: string): Promise<{ message: string }> {
    try {
      const existing = await this.invoiceLineItemDbService.findInvoiceLineItemByUId(invoiceLineItemUId);
      if (!existing) {
        throw { status: 404, message: "Invoice Line Item not found" };
      }
      await this.invoiceLineItemDbService.archiveInvoiceLineItem(existing.id!);
      this.logger.info(`Invoice Line Item deleted with UId: ${invoiceLineItemUId}`);
      return { message: "Invoice Line Item deleted successfully" };
    } catch (error: any) {
      this.logger.error("Error deleting invoice line item", error);
      throw error.status ? error : { status: 500, message: "Failed to delete invoice line item" };
    }
  }
}

export default InvoiceLineItemService;