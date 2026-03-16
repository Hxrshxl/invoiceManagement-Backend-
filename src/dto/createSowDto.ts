import { IsString, IsNotEmpty, IsNumber, IsDateString, IsArray } from "class-validator";

export class CreateSowDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  totalValue: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsDateString()
  @IsNotEmpty()
  validFrom: Date;

  @IsDateString()
  @IsNotEmpty()
  validUpto: Date;

  @IsString()
  @IsNotEmpty()
  customerPONumber: string;

  @IsString()
  @IsNotEmpty()
  customerSONumber: string;

  @IsArray()
  @IsString({ each: true })
  invoiceEmailAddresses: string[];
}