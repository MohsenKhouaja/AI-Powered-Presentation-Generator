import dotenv from "dotenv";
import process from "process";
import { drizzle } from "drizzle-orm/mysql2";
import { relations } from "./drizzle/schema.js";
import { MongoClient } from "mongodb";
import { logger } from "../config/logger.js";

dotenv.config({ quiet: true });

const poolParams = {
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
};

const DATABASE_URL = `mysql://${poolParams.user}:${poolParams.password}@${poolParams.host}:${poolParams.port}/${poolParams.name}`;

export const db = drizzle(DATABASE_URL, { relations });

export type TransactionContext = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];
export type DBContext = typeof db | TransactionContext;

logger.info({ database: "mysql" }, "Database client initialized");

if (!process.env.MONGO_URI) {
  throw new Error("E042: MONGO_URI environment variable is not set");
}

const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
export const mongoDB = mongoClient.db("myDatabase");

logger.info({ database: "mongodb" }, "Database connection established");
