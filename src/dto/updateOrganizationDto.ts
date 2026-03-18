import { IsString, IsNotEmpty, IsEmail, IsOptional } from "class-validator";

export class UpdateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  organizationUId: string;

  @IsString()
  @IsOptional()
  gstNo?: string;

  @IsString()
  @IsOptional()
  panNo?: string;

  @IsString()
  @IsOptional()
  legalOrganizationName?: string;

  @IsString()
  @IsOptional()
  invoiceTemplateId?: string;

  @IsString()
  @IsOptional()
  shortName?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  addressId?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}