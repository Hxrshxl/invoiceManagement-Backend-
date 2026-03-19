import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateSowPaymentPlanLineItemDto {
  @IsString()
  @IsNotEmpty()
  sowPaymentPlanUId: string;

  @IsString()
  @IsNotEmpty()
  sowUId: string;

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