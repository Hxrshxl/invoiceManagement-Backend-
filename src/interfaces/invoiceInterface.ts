export interface IInvoice {
  id?: string;
  invoiceUId?: string;
  version?: number;
  archive?: boolean;
  sowId: string;
  sowPaymentPlanId: string;
  customerId: string;
  status: "Drafted" | "Approved" | "Cancelled";
  totalInvoiceValue: number;
  invoiceAmount: number;
  invoiceTaxAmount: number;
  invoiceSentOn?: Date;
  paymentReceivedOn?: Date;
  invoiceVersionNo: number;
  paymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}