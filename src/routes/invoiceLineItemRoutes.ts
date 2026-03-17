import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItemController from "../controllers/invoiceLineItemController";

const invoiceLineItemRouter = Router();

invoiceLineItemRouter.post("/createInvoiceLineItem", (req: Request, res: Response) => {
  container.get<InvoiceLineItemController>(TYPES.InvoiceLineItemController).createInvoiceLineItemHandler(req, res);
});
invoiceLineItemRouter.post("/getInvoiceLineItemsByInvoiceId", (req: Request, res: Response) => {
  container.get<InvoiceLineItemController>(TYPES.InvoiceLineItemController).getInvoiceLineItemsByInvoiceIdHandler(req, res);
});

export default invoiceLineItemRouter;