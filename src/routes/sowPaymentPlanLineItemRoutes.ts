import { Router } from "express";
import { injectable, inject } from "inversify";
import { Request, Response } from "express";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanLineItemController from "../controllers/sowPaymentPlanLineItemController";

@injectable()
export class SowPaymentPlanLineItemRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.SowPaymentPlanLineItemController)
    private readonly controller: SowPaymentPlanLineItemController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createSowPaymentPlanLineItem", (req: Request, res: Response) =>
      this.controller.createSowPaymentPlanLineItemHandler(req, res)
    );
    this.router.post("/getAllSowPaymentPlanLineItems", (req: Request, res: Response) =>
      this.controller.getAllSowPaymentPlanLineItemsHandler(req, res)
    );
    this.router.post("/getSowPaymentPlanLineItemsByPlanId", (req: Request, res: Response) =>
      this.controller.getSowPaymentPlanLineItemsByPlanIdHandler(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}