import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  conflict,
  unauthorized,
} from "../errors/http-error.js";
import { errorHandler } from "../middleware/error-handler.js";

const { login, signup } = vi.hoisted(() => ({
  login: vi.fn(),
  signup: vi.fn(),
}));

vi.mock("../api/users/users-service.js", () => ({
  usersService: { login, signup },
}));
vi.mock("../database/index.js", () => ({ db: {} }));

process.env.JWT_ACCESS_TOKEN_SECRET_KEY = "test-access-secret";
process.env.JWT_REFRESH_TOKEN_SECRET_KEY = "test-refresh-secret";

const { default: authRouter } = await import("./auth.js");

const createTestApp = () => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use(errorHandler);
  return app;
};

describe("authentication routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a safe 500 when login persistence fails", async () => {
    login.mockRejectedValue(new Error("database credentials leaked"));

    const response = await request(createTestApp())
      .post("/auth/login")
      .send({ email: "user@example.com", password: "secret" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  });

  it("returns the semantic invalid-credentials response", async () => {
    login.mockRejectedValue(
      unauthorized("Invalid email or password", "INVALID_CREDENTIALS"),
    );

    const response = await request(createTestApp())
      .post("/auth/login")
      .send({ email: "user@example.com", password: "wrong" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Invalid email or password",
      code: "INVALID_CREDENTIALS",
    });
  });

  it("returns the semantic registration-conflict response", async () => {
    signup.mockRejectedValue(
      conflict("User already exists", "USER_ALREADY_EXISTS"),
    );

    const response = await request(createTestApp())
      .post("/auth/register")
      .send({ email: "user@example.com", password: "secret" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "User already exists",
      code: "USER_ALREADY_EXISTS",
    });
  });

  it("routes a missing refresh token through the global handler", async () => {
    const response = await request(createTestApp()).post("/auth/refresh");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "Authentication failed",
      code: "REFRESH_TOKEN_INVALID",
    });
  });
});
