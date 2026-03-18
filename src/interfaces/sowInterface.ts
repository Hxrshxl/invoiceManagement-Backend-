export interface ISow {
  id?: string;
  sowUId?: string;
  version?: number;
  archive?: boolean;
  customerId: string;
  title: string;
  totalValue: number;
  currency: string;
  validFrom: Date;
  validUpto: Date;
  customerPONumber: string;
  customerSONumber: string;
  invoiceEmailAddresses: string[];
  createdAt?: Date;
  updatedAt?: Date;
}