import { Router } from "express";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import TYPES from "../types/inversifyTypes";
import CustomerController from "../controllers/customerController";

@injectable()
export class CustomerRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.CustomerController)
    private readonly controller: CustomerController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createCustomer", (req: Request, res: Response) =>
      this.controller.createCustomerHandler(req, res)
    );
    this.router.post("/getAllCustomers", (req: Request, res: Response) =>
      this.controller.getAllCustomersHandler(req, res)
    );
    this.router.post("/getCustomerById", (req: Request, res: Response) =>
      this.controller.getCustomerByIdHandler(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}