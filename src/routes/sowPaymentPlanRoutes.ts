import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanController from "../controllers/sowPaymentPlanController";

const sowPaymentPlanRouter = Router();

const sowPaymentPlanController = container.get<SowPaymentPlanController>(TYPES.SowPaymentPlanController);

sowPaymentPlanRouter.post("/createSowPaymentPlan", (req: Request, res: Response) => {
  sowPaymentPlanController.createSowPaymentPlanHandler(req, res);
});

sowPaymentPlanRouter.post("/getAllSowPaymentPlans", (req: Request, res: Response) => {
  sowPaymentPlanController.getAllSowPaymentPlansHandler(req, res);
});

sowPaymentPlanRouter.post("/getSowPaymentPlanById", (req: Request, res: Response) => {
  sowPaymentPlanController.getSowPaymentPlanByIdHandler(req, res);
});

sowPaymentPlanRouter.post("/getSowPaymentPlansBySowId", (req: Request, res: Response) => {
  sowPaymentPlanController.getSowPaymentPlansBySowIdHandler(req, res);
});

sowPaymentPlanRouter.post("/getInvoiceSchedule", (req: Request, res: Response) => {
  sowPaymentPlanController.getInvoiceScheduleHandler(req, res);
});

export default sowPaymentPlanRouter;