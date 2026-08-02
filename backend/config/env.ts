import dotenv from "dotenv";

dotenv.config({ quiet: true });

const REQUIRED_ENV_VARS = [
  "JWT_ACCESS_TOKEN_SECRET_KEY",
  "JWT_REFRESH_TOKEN_SECRET_KEY",
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "ALLOWED_ORIGINS",
  "PORT",
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => {
  const value = process.env[name];
  return value === undefined || value.trim() === "";
});

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required env var(s): ${missingEnvVars.join(", ")}`);
}

function readRequired(name: RequiredEnvVar): string {
  return process.env[name] as string;
}

function readPort(name: RequiredEnvVar): number {
  const value = readRequired(name);
  const port = Number(value);
  if (Number.isNaN(port)) {
    throw new Error(`Env var ${name} must be a number, got "${value}"`);
  }
  return port;
}

export const config = {
  jwt: {
    accessTokenSecret: readRequired("JWT_ACCESS_TOKEN_SECRET_KEY"),
    refreshTokenSecret: readRequired("JWT_REFRESH_TOKEN_SECRET_KEY"),
  },
  db: {
    host: readRequired("DB_HOST"),
    port: readPort("DB_PORT"),
    user: readRequired("DB_USER"),
    password: readRequired("DB_PASSWORD"),
    name: readRequired("DB_NAME"),
  },
  allowedOrigins: readRequired("ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  port: readPort("PORT"),
};
