import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional } from "class-validator";

export class UpdateSowPaymentPlanDto {
  @IsString()
  @IsNotEmpty()
  sowPaymentPlanUId: string;

  @IsDateString()
  @IsOptional()
  plannedInvoiceDate?: Date;

  @IsNumber()
  @IsOptional()
  totalActualAmount?: number;
}