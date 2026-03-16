export interface ISowPaymentPlan {
  id?: string;
  sowId: string;
  customerId: string;
  plannedInvoiceDate: Date;
  totalActualAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}