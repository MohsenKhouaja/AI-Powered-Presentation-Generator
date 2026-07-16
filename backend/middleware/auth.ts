import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";
import type { UUID } from "node:crypto";
dotenv.config({ quiet: true });

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, token missing" });
    }
    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_ACCESS_TOKEN_SECRET_KEY) {
      throw new Error(
        "JWT_ACCESS_TOKEN_SECRET_KEY environment variable is not set",
      );
    }
    const payload = jsonwebtoken.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    );
    if (!payload || typeof payload !== "object" || !("sub" in payload)) {
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
    req.authenticatedUserId = payload.sub as UUID;
    req.log = req.log.child({ userId: payload.sub });
    next();
  } catch (error) {
    const message =
      error instanceof jsonwebtoken.TokenExpiredError
        ? "Unauthorized, token expired"
        : "Unauthorized, invalid token";
    return res.status(401).json({ message });
  }
}

export default authMiddleware;
