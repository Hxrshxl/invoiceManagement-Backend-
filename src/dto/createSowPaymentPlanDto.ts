import { IsString, IsNotEmpty, IsNumber, IsDateString } from "class-validator";

export class CreateSowPaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  sowUId: string;

  @IsString()
  @IsNotEmpty()
  customerUId: string;

  @IsDateString()
  @IsNotEmpty()
  plannedInvoiceDate: Date;

  @IsNumber()
  @IsNotEmpty()
  totalActualAmount: number;
}