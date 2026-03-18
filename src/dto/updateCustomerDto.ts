import { IsString, IsNotEmpty, IsBoolean, IsDateString, IsOptional } from "class-validator";

export class UpdateCustomerDto {
  @IsString()
  @IsNotEmpty()
  customerUId: string;

  @IsString()
  @IsOptional()
  legalName?: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  addressId?: string;

  @IsBoolean()
  @IsOptional()
  isMSASigned?: boolean;

  @IsDateString()
  @IsOptional()
  msaSignedOn?: Date;

  @IsDateString()
  @IsOptional()
  msaValidFrom?: Date;

  @IsDateString()
  @IsOptional()
  msaValidUpto?: Date;

  @IsBoolean()
  @IsOptional()
  isNDASigned?: boolean;

  @IsDateString()
  @IsOptional()
  ndaSignedOn?: Date;

  @IsDateString()
  @IsOptional()
  ndaValidFrom?: Date;

  @IsDateString()
  @IsOptional()
  ndaValidUpto?: Date;
}