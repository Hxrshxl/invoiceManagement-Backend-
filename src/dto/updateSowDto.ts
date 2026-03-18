import { IsString, IsNotEmpty, IsNumber, IsDateString, IsArray, IsOptional } from "class-validator";

export class UpdateSowDto {
  @IsString()
  @IsNotEmpty()
  sowUId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  totalValue?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  validFrom?: Date;

  @IsDateString()
  @IsOptional()
  validUpto?: Date;

  @IsString()
  @IsOptional()
  customerPONumber?: string;

  @IsString()
  @IsOptional()
  customerSONumber?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  invoiceEmailAddresses?: string[];
}