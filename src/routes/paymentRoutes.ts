import { Router, Request, Response } from "express";
import container from "../config/container";
import PaymentController from "../controllers/paymentController";
import TYPES from "../types/inversifyTypes";

const paymentRouter = Router();

const paymentController = container.get<PaymentController>(TYPES.PaymentController);

paymentRouter.post("/createPayment", (req: Request, res: Response) => {
  paymentController.createPaymentHandler(req, res);
});

paymentRouter.post("/getPaymentByInvoiceId", (req: Request, res: Response) => {
  paymentController.getPaymentByInvoiceIdHandler(req, res);
});

export default paymentRouter;