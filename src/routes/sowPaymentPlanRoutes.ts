import { Router, Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanController from "../controllers/sowPaymentPlanController";

@injectable()
export class SowPaymentPlanRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.SowPaymentPlanController)
    private readonly controller: SowPaymentPlanController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createSowPaymentPlan", (req: Request, res: Response) =>
      this.controller.createSowPaymentPlanHandler(req, res)
    );
    this.router.post("/getAllSowPaymentPlans", (req: Request, res: Response) =>
      this.controller.getAllSowPaymentPlansHandler(req, res)
    );
    this.router.post("/getSowPaymentPlanById", (req: Request, res: Response) =>
      this.controller.getSowPaymentPlanByIdHandler(req, res)
    );
    this.router.post("/getSowPaymentPlansBySowId", (req: Request, res: Response) =>
      this.controller.getSowPaymentPlansBySowIdHandler(req, res)
    );
    this.router.post("/updateSowPaymentPlan", (req: Request, res: Response) =>
      this.controller.updateSowPaymentPlanHandler(req, res)
    );
    this.router.post("/deleteSowPaymentPlan", (req: Request, res: Response) =>
      this.controller.deleteSowPaymentPlanHandler(req, res)
    );
    this.router.post("/getInvoiceSchedule", (req: Request, res: Response) =>
      this.controller.getInvoiceScheduleHandler(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}