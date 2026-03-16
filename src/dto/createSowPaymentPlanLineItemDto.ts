import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateSowPaymentPlanLineItemDto {
  @IsString()
  @IsNotEmpty()
  sowPaymentPlanId: string;

  @IsString()
  @IsNotEmpty()
  sowId: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  particular: string;

  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @IsNumber()
  @IsNotEmpty()
  unit: number;

  @IsNumber()
  @IsNotEmpty()
  total: number;
}