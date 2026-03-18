export interface IInvoiceLineItem {
  id?: string;
  invoiceLineItemUId?: string;
  version?: number;
  archive?: boolean;
  invoiceId: string;
  orderNo: string;
  particular: string;
  rate: number;
  unit: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}