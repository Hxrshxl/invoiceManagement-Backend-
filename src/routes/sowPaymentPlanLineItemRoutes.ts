import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanLineItemController from "../controllers/sowPaymentPlanLineItemController";

const sowPaymentPlanLineItemRouter = Router();

const sowPaymentPlanLineItemController = container.get<SowPaymentPlanLineItemController>(TYPES.SowPaymentPlanLineItemController);

sowPaymentPlanLineItemRouter.post("/createSowPaymentPlanLineItem", (req: Request, res: Response) => {
  sowPaymentPlanLineItemController.createSowPaymentPlanLineItemHandler(req, res);
});

sowPaymentPlanLineItemRouter.post("/getAllSowPaymentPlanLineItems", (req: Request, res: Response) => {
  sowPaymentPlanLineItemController.getAllSowPaymentPlanLineItemsHandler(req, res);
});

sowPaymentPlanLineItemRouter.post("/getSowPaymentPlanLineItemsByPlanId", (req: Request, res: Response) => {
  sowPaymentPlanLineItemController.getSowPaymentPlanLineItemsByPlanIdHandler(req, res);
});

export default sowPaymentPlanLineItemRouter;