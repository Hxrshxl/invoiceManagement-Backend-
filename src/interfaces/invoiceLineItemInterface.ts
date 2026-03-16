export interface IInvoiceLineItem {
  id?: string;
  invoiceId: string;
  orderNo: string;
  particular: string;
  rate: number;
  unit: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}