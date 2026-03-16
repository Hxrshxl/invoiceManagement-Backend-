import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import CustomerService from "../services/customerService";
import { CreateCustomerDto } from "../dto/createCustomerDto";

@injectable()
class CustomerController {

  constructor(
    @inject(TYPES.CustomerService)
    private readonly customerService: CustomerService,

    @inject(TYPES.Logger)
    private readonly logger: Logger
  ) {}

  async createCustomerHandler(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(CreateCustomerDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.map((e) => Object.values(e.constraints || {})).flat(),
        });
        return;
      }

      const customer = await this.customerService.createCustomer(dto);
      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error: any) {
      this.logger.error("Error in createCustomerHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllCustomersHandler(_req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.customerService.getAllCustomers();
      res.status(200).json({
        success: true,
        message: "Customers fetched successfully",
        data: customers,
      });
    } catch (error: any) {
      this.logger.error("Error in getAllCustomersHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getCustomerByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Id is required",
        });
        return;
      }

      const customer = await this.customerService.getCustomerById(id);
      res.status(200).json({
        success: true,
        message: "Customer fetched successfully",
        data: customer,
      });
    } catch (error: any) {
      this.logger.error("Error in getCustomerByIdHandler", error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}

export default CustomerController;