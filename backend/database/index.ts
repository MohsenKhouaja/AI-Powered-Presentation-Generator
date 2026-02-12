import { readFile, writeFile } from "fs/promises";
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import process from "process";
dotenv.config();

export async function getSQLScript(fileName: string) {
  const filePath = `./${fileName}.sql`;
  const script = readFile(filePath, { encoding: "utf-8" });
  return script;
}

const poolParams = {
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
};

const pool = mysql2.createPool({
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

try {
  await pool.query(await getSQLScript("schema"));
} catch (err) {
  const mysqlErr = err as mysql2.QueryError;
  
}
