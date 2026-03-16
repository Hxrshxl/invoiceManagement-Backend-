import { IsString, IsNotEmpty, IsNumber, IsDateString } from "class-validator";

export class CreateSowPaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  sowId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsDateString()
  @IsNotEmpty()
  plannedInvoiceDate: Date;

  @IsNumber()
  @IsNotEmpty()
  totalActualAmount: number;
}