import { drizzle } from "drizzle-orm/mysql2";
import { relations } from "./drizzle/schema.js";
import { logger } from "../config/logger.js";
import { config } from "../config/env.js";

const { host, port, user, password, name } = config.db;

const DATABASE_URL = `mysql://${user}:${password}@${host}:${port}/${name}`;

export const db = drizzle(DATABASE_URL, { relations });

export type TransactionContext = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];
export type DBContext = typeof db | TransactionContext;

logger.info({ database: "mysql" }, "Database client initialized");
