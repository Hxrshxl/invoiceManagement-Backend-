import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import SowPaymentPlanController from "../controllers/sowPaymentPlanController";

const sowPaymentPlanRouter = Router();

sowPaymentPlanRouter.post("/createSowPaymentPlan", (req: Request, res: Response) => {
  container.get<SowPaymentPlanController>(TYPES.SowPaymentPlanController).createSowPaymentPlanHandler(req, res);
});
sowPaymentPlanRouter.post("/getAllSowPaymentPlans", (req: Request, res: Response) => {
  container.get<SowPaymentPlanController>(TYPES.SowPaymentPlanController).getAllSowPaymentPlansHandler(req, res);
});
sowPaymentPlanRouter.post("/getSowPaymentPlanById", (req: Request, res: Response) => {
  container.get<SowPaymentPlanController>(TYPES.SowPaymentPlanController).getSowPaymentPlanByIdHandler(req, res);
});
sowPaymentPlanRouter.post("/getSowPaymentPlansBySowId", (req: Request, res: Response) => {
  container.get<SowPaymentPlanController>(TYPES.SowPaymentPlanController).getSowPaymentPlansBySowIdHandler(req, res);
});
sowPaymentPlanRouter.post("/getInvoiceSchedule", (req: Request, res: Response) => {
  container.get<SowPaymentPlanController>(TYPES.SowPaymentPlanController).getInvoiceScheduleHandler(req, res);
});

export default sowPaymentPlanRouter;