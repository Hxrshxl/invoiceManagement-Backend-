import { injectable, inject } from "inversify";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import Sow from "../models/sowModel";
import SowPaymentPlan from "../models/sowPaymentPlanModel";
import SowPaymentPlanLineItem from "../models/sowPaymentPlanLineItemModel";
import Invoice from "../models/invoiceModel";
import InvoiceLineItem from "../models/invoiceLineItemModel";
import Payment from "../models/paymentModel";
import { CreateSowDto } from "../dto/createSowDto";
import { UpdateSowDto } from "../dto/updateSowDto";
import { ISowDbService, ICustomerDbService } from "../postgresDB/pgInterface";
import { ISow } from "../interfaces/sowInterface";

@injectable()
class SowService {
  constructor(
    @inject(TYPES.SowDbService)
    private readonly sowDbService: ISowDbService,

    @inject(TYPES.CustomerDbService)
    private readonly customerDbService: ICustomerDbService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createSow(dto: CreateSowDto): Promise<ISow> {
    try {
      const customer = await this.customerDbService.findCustomerByUId(dto.customerUId);
      if (!customer) {
        throw { status: 404, message: "Customer not found" };
      }

      const existing = await this.sowDbService.findSowByPONumber(dto.customerPONumber);
      if (existing) {
        throw { status: 409, message: "SOW with this PO number already exists" };
      }

      const sow                 = new Sow();
      sow.customerId            = customer.id;
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

      return {
        sowUId:           created.sowUId,
        customerId:       created.customerId,
        title:            created.title,
        totalValue:       created.totalValue,
        validFrom:        created.validFrom,
        validUpto:        created.validUpto,
        customerPONumber: created.customerPONumber,
        customerSONumber: created.customerSONumber,
        SowPaymentPlans:  [],
        Invoices:         [],
      } as any;
    } catch (error: any) {
      this.logger.error("Error creating SOW", error);
      throw error.status ? error : { status: 500, message: "Failed to create SOW" };
    }
  }

  async getAllSows(): Promise<ISow[]> {
    try {
      const sows = await this.sowDbService.findAllSows();
      this.logger.info(`Fetched ${sows.length} SOWs`);

      return sows.map((sow) => {
        const plans    = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
        const invoices = ((sow as any).Invoices as Invoice[])               ?? [];

        return {
          sowUId:      sow.sowUId,
          customerId:  sow.customerId,
          title:       sow.title,
          totalValue:  sow.totalValue,
          validFrom:   sow.validFrom,
          validUpto:   sow.validUpto,
          SowPaymentPlans: plans.map((plan) => {
            const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
            return {
              plannedInvoiceDate: plan.plannedInvoiceDate,
              totalActualAmount:  plan.totalActualAmount,
              SowPaymentPlanLineItems: lineItems.map((li) => ({
                orderId:    li.orderId,
                particular: li.particular,
                rate:       li.rate,
                unit:       li.unit,
                total:      li.total,
              })),
            };
          }),
          Invoices: invoices.map((invoice) => {
            const lineItems = ((invoice as any).InvoiceLineItems as InvoiceLineItem[]) ?? [];
            const payment   = (invoice as any).Payment as Payment | null;
            return {
              status:            invoice.status,
              totalInvoiceValue: invoice.totalInvoiceValue,
              invoiceAmount:     invoice.invoiceAmount,
              paymentReceivedOn: invoice.paymentReceivedOn,
              Payment: payment ? {
                paymentDate:   payment.paymentDate,
                isFullPayment: payment.isFullPayment,
                bankPayment:   payment.bankPayment,
              } : null,
            };
          }),
        } as any;
      });
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

      const plans    = ((sow as any).SowPaymentPlans as SowPaymentPlan[]) ?? [];
      const invoices = ((sow as any).Invoices as Invoice[])               ?? [];

      return {
        sowUId:      sow.sowUId,
        title:       sow.title,
        totalValue:  sow.totalValue,
        SowPaymentPlans: plans.map((plan) => {
          const lineItems = ((plan as any).SowPaymentPlanLineItems as SowPaymentPlanLineItem[]) ?? [];
          return {
            plannedInvoiceDate: plan.plannedInvoiceDate,
            totalActualAmount:  plan.totalActualAmount,
            SowPaymentPlanLineItems: lineItems.map((li) => ({
              particular: li.particular,
              rate:       li.rate,
              unit:       li.unit,
              total:      li.total,
            })),
          };
        }),
        Invoices: invoices.map((invoice) => {
          const lineItems = ((invoice as any).InvoiceLineItems as InvoiceLineItem[]) ?? [];
          const payment   = (invoice as any).Payment as Payment | null;
          return {
            status:            invoice.status,
            totalInvoiceValue: invoice.totalInvoiceValue,
            invoiceAmount:     invoice.invoiceAmount,
            paymentReceivedOn: invoice.paymentReceivedOn,
            InvoiceLineItems: lineItems.map((li) => ({
              orderNo:    li.orderNo,
              particular: li.particular,
              rate:       li.rate,
              unit:       li.unit,
              total:      li.total,
            })),
            Payment: payment ? {
              paymentDate:   payment.paymentDate,
              isFullPayment: payment.isFullPayment,
              bankPayment:   payment.bankPayment,
            } : null,
          };
        }),
      } as any;
    } catch (error: any) {
      this.logger.error(`Error fetching SOW with UId: ${sowUId}`, error);
      throw error.status ? error : { status: 500, message: "Failed to fetch SOW" };
    }
  }
}

export default SowService;