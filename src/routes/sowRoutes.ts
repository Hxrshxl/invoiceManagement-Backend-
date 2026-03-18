import { Router, Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../types/inversifyTypes";
import SowController from "../controllers/sowController";

@injectable()
export class SowRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.SowController)
    private readonly controller: SowController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createSow", (req: Request, res: Response) =>
      this.controller.createSowHandler(req, res)
    );
    this.router.post("/getAllSows", (req: Request, res: Response) =>
      this.controller.getAllSowsHandler(req, res)
    );
    this.router.post("/getSowById", (req: Request, res: Response) =>
      this.controller.getSowByIdHandler(req, res)
    );
    this.router.post("/updateSow", (req: Request, res: Response) =>
      this.controller.updateSowHandler(req, res)
    );
    this.router.post("/deleteSow", (req: Request, res: Response) =>
      this.controller.deleteSowHandler(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}