import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import PaymentController from "../controllers/paymentController";

const paymentRouter = Router();

paymentRouter.post("/createPayment", (req: Request, res: Response) => {
  container.get<PaymentController>(TYPES.PaymentController).createPaymentHandler(req, res);
});
paymentRouter.post("/getPaymentByInvoiceId", (req: Request, res: Response) => {
  container.get<PaymentController>(TYPES.PaymentController).getPaymentByInvoiceIdHandler(req, res);
});

export default paymentRouter;