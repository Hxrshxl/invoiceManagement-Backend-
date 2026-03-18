import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

export const validateDto = async <T extends object>(
  dtoClass: new () => T,
  plain: object
): Promise<{ errors: string[]; dto: T }> => {
  const dto    = plainToClass(dtoClass, plain);
  const errors = await validate(dto);

  return {
    dto,
    errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
  };
};

export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

export const isPositiveNumber = (value: number): boolean => {
  return typeof value === "number" && value > 0;
};

export const isValidDate = (value: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};