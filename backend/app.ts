import { mkdirSync } from "node:fs";
import dotenv from "dotenv";
import { UPLOAD_PATH } from "./config/uploads.js";
import { logger } from "./config/logger.js";
import { createApp } from "./create-app.js";
import { registerGracefulShutdown } from "./shutdown.js";

dotenv.config({ quiet: true });

const missingEnvVars = [];
if (!process.env.JWT_ACCESS_TOKEN_SECRET_KEY) {
  missingEnvVars.push("JWT_ACCESS_TOKEN_SECRET_KEY");
}
if (!process.env.JWT_REFRESH_TOKEN_SECRET_KEY) {
  missingEnvVars.push("JWT_REFRESH_TOKEN_SECRET_KEY");
}
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required env var(s): ${missingEnvVars.join(", ")}`);
}

mkdirSync(UPLOAD_PATH, { recursive: true });

const app = createApp();
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  logger.info({ port }, "HTTP server started");
});

registerGracefulShutdown(server);

export default app;
