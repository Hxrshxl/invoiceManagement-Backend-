import { Router, Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../types/inversifyTypes";
import InvoiceLineItemController from "../controllers/invoiceLineItemController";

@injectable()
export class InvoiceLineItemRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.InvoiceLineItemController)
    private readonly controller: InvoiceLineItemController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createInvoiceLineItem", (req: Request, res: Response) =>
      this.controller.createInvoiceLineItemHandler(req, res)
    );
    this.router.post("/getInvoiceLineItemsByInvoiceId", (req: Request, res: Response) =>
      this.controller.getInvoiceLineItemsByInvoiceIdHandler(req, res)
    );
    // this.router.post("/updateInvoiceLineItem", (req: Request, res: Response) =>
    //   this.controller.updateInvoiceLineItemHandler(req, res)
    // );
    // this.router.post("/deleteInvoiceLineItem", (req: Request, res: Response) =>
    //   this.controller.deleteInvoiceLineItemHandler(req, res)
    // );
  }

  getRouter(): Router {
    return this.router;
  }
}