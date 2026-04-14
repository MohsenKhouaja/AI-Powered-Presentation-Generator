import { Router } from "express";
import { presentationsRouter } from "./presentations/router.js";

export const apiRouter = Router();

apiRouter.use(presentationsRouter);
