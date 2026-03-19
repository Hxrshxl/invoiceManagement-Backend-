import { Router, Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../types/inversifyTypes";
import PaymentController from "../controllers/paymentController";

@injectable()
export class PaymentRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.PaymentController)
    private readonly controller: PaymentController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createPayment", (req: Request, res: Response) =>
      this.controller.createPaymentHandler(req, res)
    );
    this.router.post("/getPaymentByInvoiceId", (req: Request, res: Response) =>
      this.controller.getPaymentByInvoiceIdHandler(req, res)
    );
    // this.router.post("/updatePayment", (req: Request, res: Response) =>
    //   this.controller.updatePaymentHandler(req, res)
    // );
    // this.router.post("/deletePayment", (req: Request, res: Response) =>
    //   this.controller.deletePaymentHandler(req, res)
    // );
  }

  getRouter(): Router {
    return this.router;
  }
}