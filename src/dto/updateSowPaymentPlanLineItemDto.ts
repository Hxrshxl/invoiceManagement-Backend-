import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class UpdateSowPaymentPlanLineItemDto {
  @IsString()
  @IsNotEmpty()
  sowPaymentPlanLineItemUId: string;

  @IsString()
  @IsOptional()
  orderId?: string;

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