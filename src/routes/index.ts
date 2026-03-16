import { Router } from "express";
import organizationRouter from "./organizationRoutes";
import customerRouter from "./customerRoutes";
import sowRouter from "./sowRoutes";
import sowPaymentPlanRouter from "./sowPaymentPlanRoutes";
import sowPaymentPlanLineItemRouter from "./sowPaymentPlanLineItemRoutes";
import invoiceRouter from "./invoiceRoutes";

const router = Router();

router.use("/organizations", organizationRouter);
router.use("/customers", customerRouter);
router.use("/sows", sowRouter);
router.use("/sowPaymentPlans", sowPaymentPlanRouter);
router.use("/sowPaymentPlanLineItems", sowPaymentPlanLineItemRouter);
router.use("/invoices", invoiceRouter);

export default router;