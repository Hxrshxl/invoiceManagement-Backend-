import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import SowController from "../controllers/sowController";

const sowRouter = Router();

sowRouter.post("/createSow", (req: Request, res: Response) => {
  container.get<SowController>(TYPES.SowController).createSowHandler(req, res);
});
sowRouter.post("/getAllSows", (req: Request, res: Response) => {
  container.get<SowController>(TYPES.SowController).getAllSowsHandler(req, res);
});
sowRouter.post("/getSowById", (req: Request, res: Response) => {
  container.get<SowController>(TYPES.SowController).getSowByIdHandler(req, res);
});

export default sowRouter;