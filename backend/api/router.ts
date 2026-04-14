import { Router } from "express";
import { contextsRouter } from "./contexts/router.js";
import { filesRouter } from "./files/router.js";
import { presentationsRouter } from "./presentations/router.js";
import { presentationsAccessRouter } from "./presentations_access/router.js";
import { usersRouter } from "./users/router.js";

export const apiRouter = Router();

apiRouter.use(usersRouter);
apiRouter.use(presentationsRouter);
apiRouter.use(contextsRouter);
apiRouter.use(filesRouter);
apiRouter.use(presentationsAccessRouter);
