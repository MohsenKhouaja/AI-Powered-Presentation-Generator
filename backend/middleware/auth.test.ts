import express from "express";
import jsonwebtoken from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import authMiddleware from "./auth.js";
import { errorHandler } from "./error-handler.js";

const secret = "test-access-token-secret";
const previousSecret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;

const createTestApp = () => {
  const app = express();
  app.use(authMiddleware);
  app.get("/protected", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(errorHandler);
  return app;
};

describe("authentication error interface", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY = secret;
  });

  afterAll(() => {
    if (previousSecret === undefined) {
      delete process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
    } else {
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY = previousSecret;
    }
  });

  it("reports a missing bearer token through the global error handler", async () => {
    const response = await request(createTestApp()).get("/protected");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Unauthorized, token missing",
      code: "AUTH_TOKEN_MISSING",
    });
  });

  it("reports an invalid bearer token through the global error handler", async () => {
    const response = await request(createTestApp())
      .get("/protected")
      .set("Authorization", "Bearer invalid");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Unauthorized, invalid token",
      code: "AUTH_TOKEN_INVALID",
    });
  });

  it("distinguishes an expired bearer token", async () => {
    const token = jsonwebtoken.sign({ sub: "user" }, secret, {
      expiresIn: -1,
    });
    const response = await request(createTestApp())
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Unauthorized, token expired",
      code: "AUTH_TOKEN_EXPIRED",
    });
  });
});
