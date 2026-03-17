import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import CustomerController from "../controllers/customerController";

const customerRouter = Router();

customerRouter.post("/createCustomer", (req: Request, res: Response) => {
  container.get<CustomerController>(TYPES.CustomerController).createCustomerHandler(req, res);
});
customerRouter.post("/getAllCustomers", (req: Request, res: Response) => {
  container.get<CustomerController>(TYPES.CustomerController).getAllCustomersHandler(req, res);
});
customerRouter.post("/getCustomerById", (req: Request, res: Response) => {
  container.get<CustomerController>(TYPES.CustomerController).getCustomerByIdHandler(req, res);
});

export default customerRouter;