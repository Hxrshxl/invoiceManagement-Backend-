import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsDateString, IsOptional } from "class-validator";

export class UpdatePaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentUId: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: Date;

  @IsNumber()
  @IsOptional()
  forExAmount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @IsOptional()
  indianAmount?: number;

  @IsBoolean()
  @IsOptional()
  isFullPayment?: boolean;

  @IsString()
  @IsOptional()
  bankPayment?: string;

  @IsString()
  @IsOptional()
  details?: string;
}