import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import process from "process";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema.js";
import { MongoClient } from "mongodb";
dotenv.config();

const poolParams = {
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
};

export const pool = mysql2.createPool({
  host: poolParams.host,
  user: poolParams.user,
  password: poolParams.password,
  database: poolParams.name,
  port: parseInt(poolParams.port),
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
});

export const db = drizzle(pool, { schema, mode: "default" });

type TransactionContext = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DBContext = typeof db | TransactionContext;

console.log("MySQL Database initialized");

const mongoClient = new MongoClient(process.env.MONGO_URI);
await mongoClient.connect();
export const mongoDB = mongoClient.db("myDatabase");

console.log("MongoDB initialized");

