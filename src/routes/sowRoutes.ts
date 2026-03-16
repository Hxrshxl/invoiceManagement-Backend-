import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import SowController from "../controllers/sowController";

const sowRouter = Router();

const sowController = container.get<SowController>(TYPES.SowController);

sowRouter.post("/createSow", (req: Request, res: Response) => {
  sowController.createSowHandler(req, res);
});

sowRouter.post("/getAllSows", (req: Request, res: Response) => {
  sowController.getAllSowsHandler(req, res);
});

sowRouter.post("/getSowById", (req: Request, res: Response) => {
  sowController.getSowByIdHandler(req, res);
});

export default sowRouter;