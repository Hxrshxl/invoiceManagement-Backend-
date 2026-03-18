export interface IOrganization {
  id?: string;
  organizationUId?: string;
  version?: number;
  archive?: boolean;
  gstNo: string;
  panNo: string;
  legalOrganizationName: string;
  invoiceTemplateId: string;
  shortName: string;
  contactName: string;
  displayName: string;
  email: string;
  addressId: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}