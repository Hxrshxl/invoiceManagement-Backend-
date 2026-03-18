import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import { Logger } from "winston";
import TYPES from "../types/inversifyTypes";
import CustomerService from "../services/customerService";
import { validateDto } from "../common/typeValidation";
import { CreateCustomerDto } from "../dto/createCustomerDto";
import { UpdateCustomerDto } from "../dto/updateCustomerDto";

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
      const { dto, errors } = await validateDto(CreateCustomerDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const customer = await this.customerService.createCustomer(dto);
      res.status(201).json({ success: true, message: "Customer created successfully", data: customer });
    } catch (error: any) {
      this.logger.error("Error in createCustomerHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getAllCustomersHandler(_req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.customerService.getAllCustomers();
      res.status(200).json({ success: true, message: "Customers fetched successfully", data: customers });
    } catch (error: any) {
      this.logger.error("Error in getAllCustomersHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async getCustomerByIdHandler(req: Request, res: Response): Promise<void> {
    try {
      const { customerUId } = req.body;
      if (!customerUId) {
        res.status(400).json({ success: false, message: "customerUId is required" });
        return;
      }
      const customer = await this.customerService.getCustomerById(customerUId);
      res.status(200).json({ success: true, message: "Customer fetched successfully", data: customer });
    } catch (error: any) {
      this.logger.error("Error in getCustomerByIdHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async updateCustomerHandler(req: Request, res: Response): Promise<void> {
    try {
      const { dto, errors } = await validateDto(UpdateCustomerDto, req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, message: "Validation failed", errors });
        return;
      }
      const customer = await this.customerService.updateCustomer(dto);
      res.status(200).json({ success: true, message: "Customer updated successfully", data: customer });
    } catch (error: any) {
      this.logger.error("Error in updateCustomerHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }

  async deleteCustomerHandler(req: Request, res: Response): Promise<void> {
    try {
      const { customerUId } = req.body;
      if (!customerUId) {
        res.status(400).json({ success: false, message: "customerUId is required" });
        return;
      }
      const result = await this.customerService.deleteCustomer(customerUId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      this.logger.error("Error in deleteCustomerHandler", error);
      res.status(error.status || 500).json({ success: false, message: error.message || "Internal server error" });
    }
  }
}

export default CustomerController;