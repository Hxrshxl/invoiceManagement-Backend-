import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import CustomerController from "../controllers/customerController";

const customerRouter = Router();

const customerController = container.get<CustomerController>(TYPES.CustomerController);

customerRouter.post("/createCustomer", (req: Request, res: Response) => {
  customerController.createCustomerHandler(req, res);
});

customerRouter.post("/getAllCustomers", (req: Request, res: Response) => {
  customerController.getAllCustomersHandler(req, res);
});

customerRouter.post("/getCustomerById", (req: Request, res: Response) => {
  customerController.getCustomerByIdHandler(req, res);
});

export default customerRouter;