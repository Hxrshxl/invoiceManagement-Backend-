export interface ISowPaymentPlanLineItem {
  id?: string;
  sowPaymentPlanId: string;
  sowId: string;
  orderId: string;
  particular: string;
  rate: number;
  unit: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}