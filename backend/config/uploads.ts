import dotenv from "dotenv";
import path from "node:path";

dotenv.config();

export const UPLOAD_PATH = path.resolve(
  process.cwd(),
  process.env.UPLOAD_PATH?.trim() || "uploads",
);
