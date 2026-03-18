export interface ISowPaymentPlanLineItem {
  id?: string;
  sowPaymentPlanLineItemUId?: string;
  version?: number;
  archive?: boolean;
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