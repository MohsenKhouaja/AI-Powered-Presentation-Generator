import express from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import { apiRouter } from "./api/router.js";
import { publicPresentationShareRouter } from "./api/presentations_access/router.js";
import { httpLogger } from "./config/logger.js";
import { HttpError } from "./errors/http-error.js";
import authMiddleware from "./middleware/auth.js";
import { errorHandler, routeNotFound } from "./middleware/error-handler.js";
import authRouter from "./routes/auth.js";

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOptions: CorsOptions = {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new HttpError(403, "Not allowed by CORS", "CORS_DENIED"));
    },
  };

  app.use(httpLogger);
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/public/share", publicPresentationShareRouter);
  app.use("/api", authMiddleware, apiRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use(routeNotFound);
  app.use(errorHandler);

  return app;
}
