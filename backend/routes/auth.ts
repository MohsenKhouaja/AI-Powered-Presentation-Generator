import express, { type Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { usersService } from "../api/users/users-service.js";
import { db } from "../database/index.js";
import { logger } from "../config/logger.js";
import { badRequest, unauthorized } from "../errors/http-error.js";
dotenv.config({ quiet: true });
export const authRouter = express.Router();
/* interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
} */

const accessTokenExpirationSeconds = 15 * 60;
const refreshTokenExpirationSeconds = 30 * 24 * 60 * 60;
const JWT_ACCESS_TOKEN_SECRET_KEY = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
const JWT_REFRESH_TOKEN_SECRET_KEY = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

if (!JWT_ACCESS_TOKEN_SECRET_KEY || !JWT_REFRESH_TOKEN_SECRET_KEY) {
  const missing = [];
  if (!JWT_ACCESS_TOKEN_SECRET_KEY) missing.push("JWT_ACCESS_TOKEN_SECRET_KEY");
  if (!JWT_REFRESH_TOKEN_SECRET_KEY)
    missing.push("JWT_REFRESH_TOKEN_SECRET_KEY");
  const message = `Missing env var(s): ${missing.join(", ")}`;
  logger.error({ missingEnvVars: missing }, message);
  throw new Error(message);
}
const accessTokenSecret: string = JWT_ACCESS_TOKEN_SECRET_KEY;
const refreshTokenSecret: string = JWT_REFRESH_TOKEN_SECRET_KEY;

function createAuthTokens(
  res: Response,
  userId: string,
): void {
  const accessTokenPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + accessTokenExpirationSeconds,
  };
  const refreshTokenPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + refreshTokenExpirationSeconds,
  };
  const accessToken = jsonwebtoken.sign(
    accessTokenPayload,
    accessTokenSecret,
    { algorithm: "HS256" },
  );
  const refreshToken = jsonwebtoken.sign(
    refreshTokenPayload,
    refreshTokenSecret,
    { algorithm: "HS256" },
  );
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(201).send({ accessToken, accesToken: accessToken });
}

authRouter.post("/login", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  const user = await usersService.login(db, email, password);
  createAuthTokens(res, user.id);
});

authRouter.post("/register", async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";
  if (!email) {
    throw badRequest("Email is required", "EMAIL_REQUIRED");
  }
  if (!password) {
    throw badRequest("Password is required", "PASSWORD_REQUIRED");
  }

  const baseUsername = email.split("@")[0]?.trim() || "user";
  const user = await usersService.signup(db, {
    username: `${baseUsername}-${randomUUID().slice(0, 8)}`,
    email,
    password,
  });
  createAuthTokens(res, user.id);
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const payload = jsonwebtoken.verify(
      req.cookies.refreshToken,
      refreshTokenSecret,
    );
    const accessTokenPayload = {
      sub: payload.sub,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + accessTokenExpirationSeconds,
    };
    const accessToken = jsonwebtoken.sign(
      accessTokenPayload,
      accessTokenSecret,
      {
        algorithm: "HS256",
      },
    );
    res.status(200).send({ accessToken });
  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      throw unauthorized(
        "Authentication failed",
        "REFRESH_TOKEN_INVALID",
      );
    }
    throw error;
  }
});

export default authRouter;
