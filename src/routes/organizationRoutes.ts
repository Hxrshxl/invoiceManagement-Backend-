import { Router, Request, Response } from "express";
import container from "../config/container";
import TYPES from "../types/inversifyTypes";
import OrganizationController from "../controllers/organizationController";

const organizationRouter = Router();

const organizationController = container.get<OrganizationController>(TYPES.OrganizationController);

organizationRouter.post("/createOrganization", (req: Request, res: Response) => {
  organizationController.createOrganizationHandler(req, res);
});

organizationRouter.post("/getAllOrganizations", (req: Request, res: Response) => {
  organizationController.getAllOrganizationsHandler(req, res);
});

organizationRouter.post("/getOrganizationById", (req: Request, res: Response) => {
  organizationController.getOrganizationByIdHandler(req, res);
});

export default organizationRouter;