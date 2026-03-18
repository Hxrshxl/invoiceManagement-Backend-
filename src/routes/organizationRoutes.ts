import { Router, Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../types/inversifyTypes";
import OrganizationController from "../controllers/organizationController";

@injectable()
export class OrganizationRoutes {
  private readonly router: Router;

  constructor(
    @inject(TYPES.OrganizationController)
    private readonly controller: OrganizationController
  ) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post("/createOrganization", (req: Request, res: Response) =>
      this.controller.createOrganizationHandler(req, res)
    );
    this.router.post("/getAllOrganizations", (req: Request, res: Response) =>
      this.controller.getAllOrganizationsHandler(req, res)
    );
    this.router.post("/getOrganizationById", (req: Request, res: Response) =>
      this.controller.getOrganizationByIdHandler(req, res)
    );
    this.router.post("/updateOrganization", (req: Request, res: Response) =>
      this.controller.updateOrganizationHandler(req, res)
    );
    this.router.post("/deleteOrganization", (req: Request, res: Response) =>
      this.controller.deleteOrganizationHandler(req, res)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}