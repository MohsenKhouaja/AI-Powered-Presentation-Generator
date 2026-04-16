import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { mkdirSync } from "node:fs";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import authMiddleware from "./middleware/auth.js";
import cookieParser from "cookie-parser";
import { apiRouter } from "./api/router.js";

dotenv.config();

export const UPLOAD_PATH = path.resolve(
  process.cwd(),
  process.env.UPLOAD_PATH?.trim() || "uploads",
);

mkdirSync(UPLOAD_PATH, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authMiddleware);

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any | Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }

  const status =
    typeof (err as { status?: unknown })?.status === "number"
      ? (err as { status: number }).status
      : typeof (err as { statusCode?: unknown })?.statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : 500;

  const errorMessage =
    err instanceof Error && err.message
      ? err.message
      : typeof (err as { message?: unknown })?.message === "string"
        ? (err as { message: string }).message
        : "An unexpected error occurred";

  const safeMessage =
    status === 500
      ? process.env.NODE_ENV !== "production"
        ? errorMessage
        : "Internal server error"
      : errorMessage;

  res.status(status).json({ error: safeMessage });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
