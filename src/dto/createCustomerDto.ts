import { IsString, IsNotEmpty, IsBoolean, IsDateString } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  shortName: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsBoolean()
  isMSASigned: boolean;

  @IsDateString()
  msaSignedOn: Date;

  @IsDateString()
  msaValidFrom: Date;

  @IsDateString()
  msaValidUpto: Date;

  @IsBoolean()
  isNDASigned: boolean;

  @IsDateString()
  ndaSignedOn: Date;

  @IsDateString()
  ndaValidFrom: Date;

  @IsDateString()
  ndaValidUpto: Date;
}