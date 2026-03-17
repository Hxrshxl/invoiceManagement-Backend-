import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateInvoiceLineItemDto {

  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @IsString()
  @IsNotEmpty()
  orderNo: string;

  @IsString()
  @IsNotEmpty()
  particular: string;

  @IsNumber()
  rate: number;

  @IsNumber()
  unit: number;

  @IsNumber()
  total: number;
}