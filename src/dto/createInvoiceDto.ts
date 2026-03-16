import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from "class-validator";

export enum InvoiceStatus {
  Drafted   = "Drafted",
  Approved  = "Approved",
  Cancelled = "Cancelled",
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  sowId: string;

  @IsString()
  @IsNotEmpty()
  sowPaymentPlanId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsNumber()
  @IsNotEmpty()
  totalInvoiceValue: number;

  @IsNumber()
  @IsNotEmpty()
  invoiceAmount: number;

  @IsNumber()
  @IsOptional()
  invoiceTaxAmount?: number;

  @IsNumber()
  @IsOptional()
  invoiceVersionNo?: number;

  @IsString()
  @IsOptional()
  paymentId?: string;
}

export class ApproveInvoiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class CancelInvoiceDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class GetInvoiceByIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}