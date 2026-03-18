import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateInvoiceLineItemDto {
  @IsString()
  @IsNotEmpty()
  invoiceLineItemUId: string;

  @IsString()
  @IsOptional()
  orderNo?: string;

  @IsString()
  @IsOptional()
  particular?: string;

  @IsNumber()
  @IsOptional()
  rate?: number;

  @IsNumber()
  @IsOptional()
  unit?: number;

  @IsNumber()
  @IsOptional()
  total?: number;
}