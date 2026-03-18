export interface IPayment {
  id?: string;
  paymentUId?: string;
  version?: number;
  archive?: boolean;
  invoiceId: string;
  paymentDate: Date;
  forExAmount: number;
  currency: string;
  indianAmount: number;
  isFullPayment: boolean;
  bankPayment?: string;
  details?: string;
  createdAt?: Date;
  updatedAt?: Date;
}