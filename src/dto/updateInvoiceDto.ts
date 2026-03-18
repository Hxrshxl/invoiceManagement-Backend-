import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from "class-validator";
import { InvoiceStatus } from "./createInvoiceDto";

export class UpdateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceUId: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsNumber()
  @IsOptional()
  totalInvoiceValue?: number;

  @IsNumber()
  @IsOptional()
  invoiceAmount?: number;

  @IsNumber()
  @IsOptional()
  invoiceTaxAmount?: number;

  @IsNumber()
  @IsOptional()
  invoiceVersionNo?: number;
}