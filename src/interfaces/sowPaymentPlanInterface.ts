export interface ISowPaymentPlan {
  id?: string;
  sowPaymentPlanUId?: string;
  version?: number;
  archive?: boolean;
  sowId: string;
  customerId: string;
  plannedInvoiceDate: Date;
  totalActualAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}