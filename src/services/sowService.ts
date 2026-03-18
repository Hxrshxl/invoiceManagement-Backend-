import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Sow from "../models/sowModel";
import { CreateSowDto } from "../dto/createSowDto";
import { UpdateSowDto } from "../dto/updateSowDto";
import { ISowDbService } from "../postgresDB/pgInterface";
import { ISow } from "../interfaces/sowInterface";

@injectable()
class SowService {
  constructor(
    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  private mapToInterface(sow: Sow): ISow {
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
    };
  }

  async createSow(dto: CreateSowDto): Promise<ISow> {
    try {
      const existing = await this.sowDbService.findSowByPONumber(dto.customerPONumber);
      if (existing) {
        throw { status: 409, message: "SOW with this PO number already exists" };
      }

      const sow = new Sow();
      sow.customerId            = dto.customerId;
      sow.title                 = dto.title;
      sow.totalValue            = dto.totalValue;
      sow.currency              = dto.currency;
      sow.validFrom             = dto.validFrom;
      sow.validUpto             = dto.validUpto;
      sow.customerPONumber      = dto.customerPONumber;
      sow.customerSONumber      = dto.customerSONumber;
      sow.invoiceEmailAddresses = dto.invoiceEmailAddresses;
      sow.version               = 1;
      sow.archive               = false;

      const created = await this.sowDbService.createSow(sow);
      this.logger.info(`SOW created with id: ${created.id}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error creating SOW", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW" };
    }
  }

  async getAllSows(): Promise<ISow[]> {
    try {
      const sows = await this.sowDbService.findAllSows();
      this.logger.info(`Fetched ${sows.length} SOWs`);
      return sows.map((s) => this.mapToInterface(s));
    } catch (error: any) {
      this.logger.error("Error fetching SOWs", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOWs" };
    }
  }

  async getSowById(sowUId: string): Promise<ISow> {
    try {
      const sow = await this.sowDbService.findSowByUId(sowUId);
      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }
      this.logger.info(`Fetched SOW with UId: ${sowUId}`);
      return this.mapToInterface(sow);
    } catch (error: any) {
      this.logger.error(`Error fetching SOW with UId: ${sowUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW" };
    }
  }

  async updateSow(dto: UpdateSowDto): Promise<ISow> {
    try {
      const existing = await this.sowDbService.findSowByUId(dto.sowUId);
      if (!existing) {
        throw { status: 404, message: "SOW not found" };
      }

      await this.sowDbService.archiveSow(existing.id!);

      const updated = new Sow();
      updated.sowUId                = existing.sowUId;
      updated.version               = existing.version + 1;
      updated.archive               = false;
      updated.customerId            = existing.customerId;
      updated.title                 = dto.title                 ?? existing.title;
      updated.totalValue            = dto.totalValue            ?? existing.totalValue;
      updated.currency              = dto.currency              ?? existing.currency;
      updated.validFrom             = dto.validFrom             ?? existing.validFrom;
      updated.validUpto             = dto.validUpto             ?? existing.validUpto;
      updated.customerPONumber      = dto.customerPONumber      ?? existing.customerPONumber;
      updated.customerSONumber      = dto.customerSONumber      ?? existing.customerSONumber;
      updated.invoiceEmailAddresses = dto.invoiceEmailAddresses ?? existing.invoiceEmailAddresses;

      const created = await this.sowDbService.createSow(updated);
      this.logger.info(`SOW updated with UId: ${dto.sowUId} version: ${created.version}`);
      return this.mapToInterface(created);
    } catch (error: any) {
      this.logger.error("Error updating SOW", error);
      throw error.status ? error : { status: 500, message: "Failed to update SOW" };
    }
  }

  async deleteSow(sowUId: string): Promise<{ message: string }> {
    try {
      const existing = await this.sowDbService.findSowByUId(sowUId);
      if (!existing) {
        throw { status: 404, message: "SOW not found" };
      }
      await this.sowDbService.archiveSow(existing.id!);
      this.logger.info(`SOW deleted with UId: ${sowUId}`);
      return { message: "SOW deleted successfully" };
    } catch (error: any) {
      this.logger.error("Error deleting SOW", error);
      throw error.status ? error : { status: 500, message: "Failed to delete SOW" };
    }
  }
}

export default SowService;