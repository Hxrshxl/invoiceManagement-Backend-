import { Router, Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../types/inversifyTypes";
import InvoiceController from "../controllers/invoiceController";

@injectable()
export class InvoiceRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.InvoiceController)
    private readonly controller: InvoiceController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/generateInvoicesForToday", (req: Request, res: Response) =>
      this.controller.generateInvoicesForTodayHandler(req, res)
    );
    this.router.post("/getAllInvoices", (req: Request, res: Response) =>
      this.controller.getAllInvoicesHandler(req, res)
    );
    this.router.post("/getInvoiceById", (req: Request, res: Response) =>
      this.controller.getInvoiceByIdHandler(req, res)
    );
    this.router.post("/approveInvoice", (req: Request, res: Response) =>
      this.controller.approveInvoiceHandler(req, res)
    );
    this.router.post("/cancelInvoice", (req: Request, res: Response) =>
      this.controller.cancelInvoiceHandler(req, res)
    );
    // this.router.post("/updateInvoice", (req: Request, res: Response) =>
    //   this.controller.updateInvoiceHandler(req, res)
    // );
    // this.router.post("/deleteInvoice", (req: Request, res: Response) =>
    //   this.controller.deleteInvoiceHandler(req, res)
    // );
  }

  getRouter(): Router {
    return this.router;
  }
}