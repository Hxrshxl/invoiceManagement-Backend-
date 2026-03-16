import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import { ISowPaymentPlan } from "../interfaces/sowPaymentPlanInterface";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";

@injectable()
class SowPaymentPlanService {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSowPaymentPlan(dto: CreateSowPaymentPlanDto): Promise<ISowPaymentPlan> {
    try {
      const sowPaymentPlan = new SowPaymentPlan();
      sowPaymentPlan.sowId              = dto.sowId;
      sowPaymentPlan.customerId         = dto.customerId;
      sowPaymentPlan.plannedInvoiceDate = dto.plannedInvoiceDate;
      sowPaymentPlan.totalActualAmount  = dto.totalActualAmount;

      const created = await sowPaymentPlan.save();

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
      const sowPaymentPlans = await SowPaymentPlan.findAll();

      this.logger.info(`Fetched ${sowPaymentPlans.length} SOW Payment Plans`);

      return sowPaymentPlans.map((plan) => ({
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
      const sowPaymentPlan = await SowPaymentPlan.findByPk(id);

      if (!sowPaymentPlan) {
        throw { status: 404, message: "SOW Payment Plan not found" };
      }

      this.logger.info(`Fetched SOW Payment Plan with id: ${id}`);

      return {
        id:                 sowPaymentPlan.id,
        sowId:              sowPaymentPlan.sowId,
        customerId:         sowPaymentPlan.customerId,
        plannedInvoiceDate: sowPaymentPlan.plannedInvoiceDate,
        totalActualAmount:  sowPaymentPlan.totalActualAmount,
        createdAt:          sowPaymentPlan.createdAt,
        updatedAt:          sowPaymentPlan.updatedAt,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching SOW Payment Plan with id: ${id}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW Payment Plan" };
    }
  }

  async getSowPaymentPlansBySowId(sowId: string): Promise<ISowPaymentPlan[]> {
    try {
      const sowPaymentPlans = await SowPaymentPlan.findAll({
        where: { sowId },
      });

      if (!sowPaymentPlans.length) {
        throw { status: 404, message: "No SOW Payment Plans found for this SOW" };
      }

      this.logger.info(`Fetched ${sowPaymentPlans.length} SOW Payment Plans for sowId: ${sowId}`);

      return sowPaymentPlans.map((plan) => ({
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
}

export default SowPaymentPlanService;