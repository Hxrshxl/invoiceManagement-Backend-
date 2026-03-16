export interface ICustomer {
  id?: string;
  organizationId: string;
  legalName: string;
  shortName: string;
  displayName: string;
  addressId: string;
  isMSASigned: boolean;
  msaSignedOn: Date;
  msaValidFrom: Date;
  msaValidUpto: Date;
  isNDASigned: boolean;
  ndaSignedOn: Date;
  ndaValidFrom: Date;
  ndaValidUpto: Date;
  createdAt?: Date;
  updatedAt?: Date;
}