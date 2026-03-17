import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import InvoiceController from "../controllers/invoiceController";

const invoiceRouter = Router();

invoiceRouter.post("/generateInvoicesForToday", (req: Request, res: Response) => {
  container.get<InvoiceController>(TYPES.InvoiceController).generateInvoicesForTodayHandler(req, res);
});
invoiceRouter.post("/getAllInvoices", (req: Request, res: Response) => {
  container.get<InvoiceController>(TYPES.InvoiceController).getAllInvoicesHandler(req, res);
});
invoiceRouter.post("/getInvoiceById", (req: Request, res: Response) => {
  container.get<InvoiceController>(TYPES.InvoiceController).getInvoiceByIdHandler(req, res);
});
invoiceRouter.post("/approveInvoice", (req: Request, res: Response) => {
  container.get<InvoiceController>(TYPES.InvoiceController).approveInvoiceHandler(req, res);
});
invoiceRouter.post("/cancelInvoice", (req: Request, res: Response) => {
  container.get<InvoiceController>(TYPES.InvoiceController).cancelInvoiceHandler(req, res);
});

export default invoiceRouter;