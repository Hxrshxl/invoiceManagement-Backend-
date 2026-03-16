import { IsString, IsNotEmpty, IsEmail } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  gstNo: string;

  @IsString()
  @IsNotEmpty()
  panNo: string;

  @IsString()
  @IsNotEmpty()
  legalOrganizationName: string;

  @IsString()
  @IsNotEmpty()
  invoiceTemplateId: string;

  @IsString()
  @IsNotEmpty()
  shortName: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}