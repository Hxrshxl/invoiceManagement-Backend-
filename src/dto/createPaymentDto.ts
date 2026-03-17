import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreatePaymentDto {

  @IsString()
  @IsNotEmpty()
  invoiceId: string;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: Date;

  @IsNumber()
  forExAmount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
  indianAmount: number;

  @IsBoolean()
  isFullPayment: boolean;

  @IsString()
  @IsOptional()
  bankPayment?: string;

  @IsString()
  @IsOptional()
  details?: string;
}