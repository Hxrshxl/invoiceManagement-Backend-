import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import { ISowPaymentPlan } from "../interfaces/sowPaymentPlanInterface";
import { CreateSowPaymentPlanDto } from "../dto/createSowPaymentPlanDto";
import { Invoice, Sow } from "../models";

@injectable()
class SowPaymentPlanService {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

 async createSowPaymentPlan(dto: CreateSowPaymentPlanDto): Promise<ISowPaymentPlan> {
  try {
    // Step 1 — Get the SOW to check totalValue
    const sow = await Sow.findByPk(dto.sowId);
    if (!sow) {
      throw { status: 404, message: "SOW not found" };
    }

    // Step 2 — Get all existing plans for this SOW
    const existingPlans = await SowPaymentPlan.findAll({
      where: { sowId: dto.sowId },
    });

    // Step 3 — Calculate total already planned
    const totalAlreadyPlanned = existingPlans.reduce(
      (sum, plan) => sum + plan.totalActualAmount, 0
    );

    // Step 4 — Check if adding this plan exceeds SOW total
    const newTotal = totalAlreadyPlanned + dto.totalActualAmount;

    if (newTotal > sow.totalValue) {
      throw {
        status: 400,
        message: `Total planned amount ($${newTotal}) exceeds SOW total value ($${sow.totalValue}). Remaining amount available: $${sow.totalValue - totalAlreadyPlanned}`,
      };
    }

    // Step 5 — Proceed with creation
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

  async getInvoiceSchedule(): Promise<any[]> {
  try {
    const plans = await SowPaymentPlan.findAll({
      include: [
        {
          model: Invoice,
          as: "Invoices",
          required: false,
        },
      ],
    });

    this.logger.info(`Fetched invoice schedule for ${plans.length} payment plans`);

    return plans.map((plan) => {
      const invoices = (plan as any).Invoices as Invoice[];
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