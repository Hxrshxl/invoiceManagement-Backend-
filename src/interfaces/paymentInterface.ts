export interface IPayment {
  id?: string;
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