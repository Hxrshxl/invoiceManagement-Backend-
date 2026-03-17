import { Router, Request, Response } from "express";
import { container } from "../app";
import TYPES from "../types/inversifyTypes";
import OrganizationController from "../controllers/organizationController";

const organizationRouter = Router();

organizationRouter.post("/createOrganization", (req: Request, res: Response) => {
  container.get<OrganizationController>(TYPES.OrganizationController).createOrganizationHandler(req, res);
});
organizationRouter.post("/getAllOrganizations", (req: Request, res: Response) => {
  container.get<OrganizationController>(TYPES.OrganizationController).getAllOrganizationsHandler(req, res);
});
organizationRouter.post("/getOrganizationById", (req: Request, res: Response) => {
  container.get<OrganizationController>(TYPES.OrganizationController).getOrganizationByIdHandler(req, res);
});

export default organizationRouter;