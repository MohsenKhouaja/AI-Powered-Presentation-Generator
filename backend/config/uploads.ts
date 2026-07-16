import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ quiet: true });

export const UPLOAD_PATH = path.resolve(
  process.cwd(),
  process.env.UPLOAD_PATH?.trim() || "uploads",
);
