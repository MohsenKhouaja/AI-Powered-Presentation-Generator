import express from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { usersService } from "../api/users/users-service.js";
import { db } from "../database/index.js";
dotenv.config();
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
  console.error(message);
  throw new Error(message);
}

async function createAuthTokens(req, res, success, userId) {
  if (success) {
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
      JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        algorithm: "HS256",
      },
    );
    const refreshToken = jsonwebtoken.sign(
      refreshTokenPayload,
      JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        algorithm: "HS256",
      },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).send({ accessToken, accesToken: accessToken });
  } else {
    res.status(401).json({
      error: {
        code: "AUTHENTICATION_FAILED",
        message: "Authentication failed",
      },
    });
  }
}

async function verifyUserCredentials(email, password) {
  try {
    const user = await usersService.login(db, email, password);
    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    return {
      success: false,
      userId: null,
    };
  }
}

async function createNewUser(email, password) {
  try {
    const baseUsername = email.split("@")[0]?.trim() || "user";
    const username = `${baseUsername}-${randomUUID().slice(0, 8)}`;
    const user = await usersService.signup(db, {
      username,
      email,
      password,
    });
    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    return {
      success: false,
      userId: null,
    };
  }
}

authRouter.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { success, userId } = await verifyUserCredentials(email, password);
  createAuthTokens(req, res, success, userId);
});

authRouter.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { success, userId } = await createNewUser(email, password);
  createAuthTokens(req, res, success, userId);
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const payload = jsonwebtoken.verify(
      req.cookies.refreshToken,
      JWT_REFRESH_TOKEN_SECRET_KEY,
    );
    const accessTokenPayload = {
      sub: payload.sub,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + accessTokenExpirationSeconds,
    };
    const accessToken = jsonwebtoken.sign(
      accessTokenPayload,
      JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        algorithm: "HS256",
      },
    );
    res.status(200).send({ accessToken });
  } catch (error) {
    if (
      error?.name === "TokenExpiredError" ||
      error?.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_FAILED",
          message: "Authentication failed",
        },
      });
    }
    console.error("Error refreshing token", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      },
    });
  }
});

export default authRouter;
