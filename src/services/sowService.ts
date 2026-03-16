import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Sow from "../models/sowModel";
import { ISow } from "../interfaces/sowInterface";
import { CreateSowDto } from "../dto/createSowDto";

@injectable()
class SowService {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSow(dto: CreateSowDto): Promise<ISow> {
    try {
      const existingSow = await Sow.findOne({
        where: { customerPONumber: dto.customerPONumber },
      });

      if (existingSow) {
        throw { status: 409, message: "SOW with this PO number already exists" };
      }

      const sow = new Sow();
      sow.customerId              = dto.customerId;
      sow.title                   = dto.title;
      sow.totalValue              = dto.totalValue;
      sow.currency                = dto.currency;
      sow.validFrom               = dto.validFrom;
      sow.validUpto               = dto.validUpto;
      sow.customerPONumber        = dto.customerPONumber;
      sow.customerSONumber        = dto.customerSONumber;
      sow.invoiceEmailAddresses   = dto.invoiceEmailAddresses;

      const created = await sow.save();

      this.logger.info(`SOW created successfully with id: ${created.id}`);

      return {
        id:                     created.id,
        customerId:             created.customerId,
        title:                  created.title,
        totalValue:             created.totalValue,
        currency:               created.currency,
        validFrom:              created.validFrom,
        validUpto:              created.validUpto,
        customerPONumber:       created.customerPONumber,
        customerSONumber:       created.customerSONumber,
        invoiceEmailAddresses:  created.invoiceEmailAddresses,
        createdAt:              created.createdAt,
        updatedAt:              created.updatedAt,
      };
    } catch (error: any) {
      this.logger.error("Error creating SOW", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW" };
    }
  }

  async getAllSows(): Promise<ISow[]> {
    try {
      const sows = await Sow.findAll();

      this.logger.info(`Fetched ${sows.length} SOWs`);

      return sows.map((sow) => ({
        id:                    sow.id,
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
      }));
    } catch (error: any) {
      this.logger.error("Error fetching SOWs", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOWs" };
    }
  }

  async getSowById(id: string): Promise<ISow> {
    try {
      const sow = await Sow.findByPk(id);

      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }

      this.logger.info(`Fetched SOW with id: ${id}`);

      return {
        id:                    sow.id,
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
    } catch (error: any) {
      this.logger.error(`Error fetching SOW with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW" };
    }
  }
}

export default SowService;