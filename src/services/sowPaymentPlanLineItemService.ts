import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import Sow from "../models/sowModel";
import { CreateSowPaymentPlanLineItemDto } from "../dto/createSowPaymentPlanLineItemDto";
import { UpdateSowPaymentPlanLineItemDto } from "../dto/updateSowPaymentPlanLineItemDto";
import { ISowPaymentPlanLineItemDbService, ISowPaymentPlanDbService, ISowDbService } from "../postgresDB/pgInterface";
import { ISowPaymentPlanLineItem } from "../interfaces/sowPaymentPlanLineItemInterface";

@injectable()
class SowPaymentPlanLineItemService {
  constructor(
    @inject(TYPES.SowPaymentPlanLineItemDbService)
    private readonly sowPaymentPlanLineItemDbService: ISowPaymentPlanLineItemDbService,

    @inject(TYPES.SowPaymentPlanDbService)
    private readonly sowPaymentPlanDbService: ISowPaymentPlanDbService,

    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowPaymentPlanLineItem(dto: CreateSowPaymentPlanLineItemDto): Promise<ISowPaymentPlanLineItem> {
    try {
      const existingPlan = await this.sowPaymentPlanDbService.findSowPaymentPlanByUId(dto.sowPaymentPlanUId);
      if (!existingPlan) {
        throw { status: 404, message: "SOW Payment Plan not found" };
      }

      const existingSow = await this.sowDbService.findSowByUId(dto.sowUId);
      if (!existingSow) {
        throw { status: 404, message: "SOW not found" };
      }

      const lineItem                    = new SowPaymentPlanLineItem();
      lineItem.sowPaymentPlanId         = existingPlan.id!;
      lineItem.sowId                    = existingSow.id!;
      lineItem.orderId                  = dto.orderId;
      lineItem.particular               = dto.particular;
      lineItem.rate                     = dto.rate;
      lineItem.unit                     = dto.unit;
      lineItem.total                    = dto.total;
      lineItem.version                  = 1;
      lineItem.archive                  = false;

      const created = await this.sowPaymentPlanLineItemDbService.createSowPaymentPlanLineItem(lineItem);
      this.logger.info(`SOW Payment Plan Line Item created with id: ${created.id}`);

      return {
        sowPaymentPlanLineItemUId: created.sowPaymentPlanLineItemUId,
        plannedInvoiceDate:        existingPlan.plannedInvoiceDate, 
        sowTitle:                  existingSow.title,              
        orderId:                   created.orderId,
        particular:                created.particular,
        rate:                      created.rate,
        unit:                      created.unit,
        total:                     created.total,
      } as any;
    } catch (error: any) {
      this.logger.error("Error creating SOW Payment Plan Line Item", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW Payment Plan Line Item" };
    }
  }

  async getAllSowPaymentPlanLineItems(): Promise<ISowPaymentPlanLineItem[]> {
    try {
      const lineItems = await this.sowPaymentPlanLineItemDbService.findAllSowPaymentPlanLineItems();
      this.logger.info(`Fetched ${lineItems.length} SOW Payment Plan Line Items`);

      return lineItems.map((lineItem) => {
        const plan = (lineItem as any).SowPaymentPlan as SowPaymentPlan | null;
        const sow  = (lineItem as any).Sow as Sow | null;
        return {
          sowPaymentPlanLineItemUId: lineItem.sowPaymentPlanLineItemUId,
          particular:                lineItem.particular,
          rate:                      lineItem.rate,
          unit:                      lineItem.unit,
          total:                     lineItem.total,
          plannedInvoiceDate:        plan?.plannedInvoiceDate ?? null, 
          sowTitle:                  sow?.title               ?? null, 
        } as any;
      });
    } catch (error: any) {
      this.logger.error("Error fetching SOW Payment Plan Line Items", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plan Line Items" };
    }
  }

  // async updateSowPaymentPlanLineItem(dto: UpdateSowPaymentPlanLineItemDto): Promise<ISowPaymentPlanLineItem> {
  //   try {
  //     const existing = await this.sowPaymentPlanLineItemDbService.findSowPaymentPlanLineItemByUId(dto.sowPaymentPlanLineItemUId);
  //     if (!existing) {
  //       throw { status: 404, message: "SOW Payment Plan Line Item not found" };
  //     }

  //     await this.sowPaymentPlanLineItemDbService.archiveSowPaymentPlanLineItem(existing.id!);

  //     const updated                    = new SowPaymentPlanLineItem();
  //     updated.sowPaymentPlanLineItemUId = existing.sowPaymentPlanLineItemUId;
  //     updated.version                  = existing.version + 1;
  //     updated.archive                  = false;
  //     updated.sowPaymentPlanId         = existing.sowPaymentPlanId;
  //     updated.sowId                    = existing.sowId;
  //     updated.orderId                  = dto.orderId    ?? existing.orderId;
  //     updated.particular               = dto.particular ?? existing.particular;
  //     updated.rate                     = dto.rate       ?? existing.rate;
  //     updated.unit                     = dto.unit       ?? existing.unit;
  //     updated.total                    = dto.total      ?? existing.total;

  //     const created = await this.sowPaymentPlanLineItemDbService.createSowPaymentPlanLineItem(updated);
  //     this.logger.info(`SOW Payment Plan Line Item updated with UId: ${dto.sowPaymentPlanLineItemUId} version: ${created.version}`);

  //     // NOTE: When uncommented, fetch plan and sow here to resolve plannedInvoiceDate and sowTitle
  //     // const plan = await this.sowPaymentPlanDbService.findSowPaymentPlanById(created.sowPaymentPlanId);
  //     // const sow  = await this.sowDbService.findSowById(created.sowId);
  //     return {
  //       sowPaymentPlanLineItemUId: created.sowPaymentPlanLineItemUId,
  //       // plannedInvoiceDate:     plan?.plannedInvoiceDate ?? null,  // ✅ use this instead of sowPaymentPlanId
  //       // sowTitle:               sow?.title               ?? null,  // ✅ use this instead of sowId
  //       orderId:                   created.orderId,
  //       particular:                created.particular,
  //       rate:                      created.rate,
  //       unit:                      created.unit,
  //       total:                     created.total,
  //     } as any;
  //   } catch (error: any) {
  //     this.logger.error("Error updating SOW Payment Plan Line Item", error);
  //     throw error.status ? error : { status: 500, message: "Failed to update SOW Payment Plan Line Item" };
  //   }
  // }

  // async deleteSowPaymentPlanLineItem(sowPaymentPlanLineItemUId: string): Promise<{ message: string }> {
  //   try {
  //     const existing = await this.sowPaymentPlanLineItemDbService.findSowPaymentPlanLineItemByUId(sowPaymentPlanLineItemUId);
  //     if (!existing) {
  //       throw { status: 404, message: "SOW Payment Plan Line Item not found" };
  //     }
  //     await this.sowPaymentPlanLineItemDbService.archiveSowPaymentPlanLineItem(existing.id!);
  //     this.logger.info(`SOW Payment Plan Line Item deleted with UId: ${sowPaymentPlanLineItemUId}`);
  //     return { message: "SOW Payment Plan Line Item deleted successfully" };
  //   } catch (error: any) {
  //     this.logger.error("Error deleting SOW Payment Plan Line Item", error);
  //     throw error.status ? error : { status: 500, message: "Failed to delete SOW Payment Plan Line Item" };
  //   }
  // }
}

export default SowPaymentPlanLineItemService;