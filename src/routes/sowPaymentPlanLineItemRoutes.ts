import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanLineItemController from "../controllers/sowPaymentPlanLineItemController";

const sowPaymentPlanLineItemRouter = Router();

sowPaymentPlanLineItemRouter.post("/createSowPaymentPlanLineItem", (req: Request, res: Response) => {
  container.get<SowPaymentPlanLineItemController>(TYPES.SowPaymentPlanLineItemController).createSowPaymentPlanLineItemHandler(req, res);
});
sowPaymentPlanLineItemRouter.post("/getAllSowPaymentPlanLineItems", (req: Request, res: Response) => {
  container.get<SowPaymentPlanLineItemController>(TYPES.SowPaymentPlanLineItemController).getAllSowPaymentPlanLineItemsHandler(req, res);
});
sowPaymentPlanLineItemRouter.post("/getSowPaymentPlanLineItemsByPlanId", (req: Request, res: Response) => {
  container.get<SowPaymentPlanLineItemController>(TYPES.SowPaymentPlanLineItemController).getSowPaymentPlanLineItemsByPlanIdHandler(req, res);
});

export default sowPaymentPlanLineItemRouter;