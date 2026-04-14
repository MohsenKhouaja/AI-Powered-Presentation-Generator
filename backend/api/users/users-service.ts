import { randomBytes, randomUUID, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { SQL } from "sql-template-strings";
import type { PoolConnection, Pool } from "mysql2/promise";
import type { User, userInsert } from "../../database/types.js";

const scrypt = promisify(scryptCallback);

const hashPassword = async (password: string): Promise<string> => {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

const signup = async (
  db: PoolConnection | Pool,
  user: userInsert,
): Promise<User> => {
  const [existingRows] = await db.query(
    SQL`select id from users where email = ${user.email} or username = ${user.username} limit 1`,
  );

  if (Array.isArray(existingRows) && existingRows.length > 0) {
    throw new Error("User with this email or username already exists");
  }

  const userId = randomUUID();
  const hashedPassword = await hashPassword(user.password);
  await db.query(
    SQL`insert into users (id, username, email, password) values (${userId}, ${user.username}, ${user.email}, ${hashedPassword})`,
  );

  return {
    id: userId,
    username: user.username,
    email: user.email,
  };
};

export const usersService = {
  signup,
} as const;
