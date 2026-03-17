import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItemController from "../controllers/invoiceLineItemController";

const invoiceLineItemRouter = Router();

const invoiceLineItemController = container.get<InvoiceLineItemController>(TYPES.InvoiceLineItemController);

invoiceLineItemRouter.post("/createInvoiceLineItem", (req: Request, res: Response) => {
  invoiceLineItemController.createInvoiceLineItemHandler(req, res);
});

invoiceLineItemRouter.post("/getInvoiceLineItemsByInvoiceId", (req: Request, res: Response) => {
  invoiceLineItemController.getInvoiceLineItemsByInvoiceIdHandler(req, res);
});

export default invoiceLineItemRouter;