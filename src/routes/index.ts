import { Router } from "express";

import { HealthController } from "../controllers/health.controller";

const router = Router();
const healthController = new HealthController();

router.get("/health", (request, response) => healthController.check(request, response));

export { router };
