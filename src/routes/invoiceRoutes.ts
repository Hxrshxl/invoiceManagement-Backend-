import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import InvoiceController from "../controllers/invoiceController";

const invoiceRouter = Router();

const invoiceController = container.get<InvoiceController>(TYPES.InvoiceController);

invoiceRouter.post("/generateInvoicesForToday", (req: Request, res: Response) => {
  invoiceController.generateInvoicesForTodayHandler(req, res);
});

invoiceRouter.post("/getAllInvoices", (req: Request, res: Response) => {
  invoiceController.getAllInvoicesHandler(req, res);
});

invoiceRouter.post("/getInvoiceById", (req: Request, res: Response) => {
  invoiceController.getInvoiceByIdHandler(req, res);
});

invoiceRouter.post("/approveInvoice", (req: Request, res: Response) => {
  invoiceController.approveInvoiceHandler(req, res);
});

invoiceRouter.post("/cancelInvoice", (req: Request, res: Response) => {
  invoiceController.cancelInvoiceHandler(req, res);
});

export default invoiceRouter;