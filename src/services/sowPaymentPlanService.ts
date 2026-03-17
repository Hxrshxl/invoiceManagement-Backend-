import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";
import { ISowPaymentPlanDbService, ISowDbService } from "../postgresDB/pgInterface";
import { ISowPaymentPlan } from "../interfaces/sowPaymentPlanInterface";

@injectable()
class SowPaymentPlanService {
  constructor(
    @inject(TYPES.SowPaymentPlanDbService)
    private readonly sowPaymentPlanDbService: ISowPaymentPlanDbService,

    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowPaymentPlan(dto: CreateSowPaymentPlanDto): Promise<ISowPaymentPlan> {
    try {
      // Check SOW exists
      const sow = await this.sowDbService.findSowById(dto.sowId);
      if (!sow) {
        throw { status: 404, message: "SOW not found" };
      }

      // Get total already planned for this SOW via DbService
      const totalAlreadyPlanned = await this.sowPaymentPlanDbService.getTotalPlannedAmountBySowId(dto.sowId);

      // Check new total does not exceed SOW total value
      const newTotal = totalAlreadyPlanned + dto.totalActualAmount;
      if (newTotal > sow.totalValue) {
        throw {
          status: 400,
          message: `Total planned amount ($${newTotal}) exceeds SOW total value ($${sow.totalValue}). Remaining amount available: $${sow.totalValue - totalAlreadyPlanned}`,
        };
      }

      // Map fields explicitly onto model instance
      const sowPaymentPlan = new SowPaymentPlan();
      sowPaymentPlan.sowId              = dto.sowId;
      sowPaymentPlan.customerId         = dto.customerId;
      sowPaymentPlan.plannedInvoiceDate = dto.plannedInvoiceDate;
      sowPaymentPlan.totalActualAmount  = dto.totalActualAmount;

      // Save via DbService
      const created = await this.sowPaymentPlanDbService.createSowPaymentPlan(sowPaymentPlan);

      this.logger.info(`SOW Payment Plan created successfully with id: ${created.id}`);

      return {
        id:                 created.id,
        sowId:              created.sowId,
        customerId:         created.customerId,
        plannedInvoiceDate: created.plannedInvoiceDate,
        totalActualAmount:  created.totalActualAmount,
        createdAt:          created.createdAt,
        updatedAt:          created.updatedAt,
      };
    } catch (error: any) {
      this.logger.error("Error creating SOW Payment Plan", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW Payment Plan" };
    }
  }

  async getAllSowPaymentPlans(): Promise<ISowPaymentPlan[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findAllSowPaymentPlans();

      this.logger.info(`Fetched ${plans.length} SOW Payment Plans`);

      return plans.map((plan) => ({
        id:                 plan.id,
        sowId:              plan.sowId,
        customerId:         plan.customerId,
        plannedInvoiceDate: plan.plannedInvoiceDate,
        totalActualAmount:  plan.totalActualAmount,
        createdAt:          plan.createdAt,
        updatedAt:          plan.updatedAt,
      }));
    } catch (error: any) {
      this.logger.error("Error fetching SOW Payment Plans", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plans" };
    }
  }

  async getSowPaymentPlanById(id: string): Promise<ISowPaymentPlan> {
    try {
      const plan = await this.sowPaymentPlanDbService.findSowPaymentPlanById(id);

      if (!plan) {
        throw { status: 404, message: "SOW Payment Plan not found" };
      }

      this.logger.info(`Fetched SOW Payment Plan with id: ${id}`);

      return {
        id:                 plan.id,
        sowId:              plan.sowId,
        customerId:         plan.customerId,
        plannedInvoiceDate: plan.plannedInvoiceDate,
        totalActualAmount:  plan.totalActualAmount,
        createdAt:          plan.createdAt,
        updatedAt:          plan.updatedAt,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plan with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plan" };
    }
  }

  async getSowPaymentPlansBySowId(sowId: string): Promise<ISowPaymentPlan[]> {
    try {
      const plans = await this.sowPaymentPlanDbService.findSowPaymentPlansBySowId(sowId);

      if (!plans.length) {
        throw { status: 404, message: "No SOW Payment Plans found for this SOW" };
      }

      this.logger.info(`Fetched ${plans.length} SOW Payment Plans for sowId: ${sowId}`);

      return plans.map((plan) => ({
        id:                 plan.id,
        sowId:              plan.sowId,
        customerId:         plan.customerId,
        plannedInvoiceDate: plan.plannedInvoiceDate,
        totalActualAmount:  plan.totalActualAmount,
        createdAt:          plan.createdAt,
        updatedAt:          plan.updatedAt,
      }));
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plans for sowId: ${sowId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plans by SOW" };
    }
  }

  async getInvoiceSchedule(): Promise<any[]> {
    try {
      // Fetch all plans with their invoices included via DbService
      const plans = await this.sowPaymentPlanDbService.findSowPaymentPlansWithInvoices();

      this.logger.info(`Fetched invoice schedule for ${plans.length} payment plans`);

      return plans.map((plan) => {
        const invoices = (plan as any).Invoices as any[];
        const invoice  = invoices && invoices.length > 0 ? invoices[0] : null;

        return {
          planId:             plan.id,
          sowId:              plan.sowId,
          customerId:         plan.customerId,
          plannedInvoiceDate: plan.plannedInvoiceDate,
          totalActualAmount:  plan.totalActualAmount,
          invoiceGenerated:   invoice ? true : false,
          invoiceId:          invoice ? invoice.id : null,
          invoiceStatus:      invoice ? invoice.status : null,
        };
      });
    } catch (error: any) {
      this.logger.error("Error fetching invoice schedule", error);
      throw error.status ? error : { status: 500, message: "Failed to fetch invoice schedule" };
    }
  }
}

export default SowPaymentPlanService;