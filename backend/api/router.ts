import { Router } from "express";
import { contextsRouter } from "./contexts/router.js";
import { presentationsRouter } from "./presentations/router.js";
import { presentationsAccessRouter } from "./presentations_access/router.js";
import { slidesRouter } from "./slides/router.js";
import { usersRouter } from "./users/router.js";

export const apiRouter = Router();

apiRouter.use(usersRouter);
apiRouter.use(presentationsRouter);
apiRouter.use(slidesRouter);
apiRouter.use(contextsRouter);
apiRouter.use(presentationsAccessRouter);
