import * as crypto from "node:crypto";
import { promisify } from "node:util";
import type { DBContext } from "../../database/index.js";
import { users } from "../../database/drizzle/schema.js";
import type { NewUserRow, UserRow } from "../../database/types.js";

const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password: string): Promise<string> => {
  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  if (!password || typeof password !== "string") {
    return false;
  }

  if (!storedHash || typeof storedHash !== "string") {
    return false;
  }

  const [algorithm, salt, key] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !key) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, storedKey);
};

const signup = async (db: DBContext, user: NewUserRow): Promise<UserRow> => {
  const existingRow = await db.query.users.findFirst({
    where: {
      OR: [{ email: user.email }, { username: user.username }],
    },
    columns: { id: true },
  });

  if (existingRow) {
    throw new Error("User with this email or username already exists");
  }

  const userId = crypto.randomUUID() as string;
  const hashedPassword = await hashPassword(user.password);
  await db.insert(users).values({
    id: userId,
    username: user.username,
    email: user.email,
    password: hashedPassword,
  });

  return {
    id: userId,
    username: user.username,
    email: user.email,
  };
};

const login = async (
  db: DBContext,
  email: string,
  password: string,
): Promise<UserRow> => {
  if (!email || typeof email !== "string") {
    throw new Error("Email is required");
  }

  if (!password || typeof password !== "string") {
    throw new Error("Password is required");
  }

  const row = await db.query.users.findFirst({
    where: { email },
    columns: {
      id: true,
      username: true,
      email: true,
      password: true,
    },
  });

  if (!row) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(password, row.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
  };
};

export const usersService = {
  signup,
  login,
} as const;
