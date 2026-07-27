import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import type { UUID } from "node:crypto";
import { unauthorized } from "../errors/http-error.js";
dotenv.config({ quiet: true });

function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(
      unauthorized("Unauthorized, token missing", "AUTH_TOKEN_MISSING"),
    );
    return;
  }

  const secret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
  if (!secret) {
    next(
      new Error("JWT_ACCESS_TOKEN_SECRET_KEY environment variable is not set"),
    );
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const payload = jsonwebtoken.verify(
      token,
      secret,
    );
    if (!payload || typeof payload !== "object" || !("sub" in payload)) {
      next(
        unauthorized("Unauthorized, invalid token", "AUTH_TOKEN_INVALID"),
      );
      return;
    }
    req.authenticatedUserId = payload.sub as UUID;
    req.log = req.log.child({ userId: payload.sub });
    next();
  } catch (error) {
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      next(
        unauthorized("Unauthorized, token expired", "AUTH_TOKEN_EXPIRED"),
      );
      return;
    }
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      next(
        unauthorized("Unauthorized, invalid token", "AUTH_TOKEN_INVALID"),
      );
      return;
    }
    next(error);
  }
}

export default authMiddleware;
