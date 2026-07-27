import express from "express";
import multer from "multer";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { HttpError, notFound } from "../errors/http-error.js";
import { errorHandler, routeNotFound } from "./error-handler.js";

const createTestApp = (error: unknown) => {
  const app = express();
  app.get("/failure", () => {
    throw error;
  });
  app.use(routeNotFound);
  app.use(errorHandler);
  return app;
};

describe("global HTTP error interface", () => {
  it("returns the status, message, and code from an expected HTTP error", async () => {
    const response = await request(
      createTestApp(notFound("Slide not found", "SLIDE_NOT_FOUND")),
    ).get("/failure");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Slide not found",
      code: "SLIDE_NOT_FOUND",
    });
  });

  it("does not expose unexpected error details", async () => {
    const response = await request(
      createTestApp(new Error("database password leaked")),
    ).get("/failure");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  });

  it("does not expose messages from untyped client errors", async () => {
    const error = Object.assign(new Error("parser implementation detail"), {
      status: 400,
    });
    const response = await request(createTestApp(error)).get("/failure");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Request failed",
      code: "BAD_REQUEST",
    });
  });

  it("does not expose expected upstream failure details", async () => {
    const response = await request(
      createTestApp(
        new HttpError(
          502,
          "OpenRouter returned a sensitive response",
          "SLIDE_GENERATION_FAILED",
        ),
      ),
    ).get("/failure");

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: "Internal server error",
      code: "SLIDE_GENERATION_FAILED",
    });
  });

  it("routes unmatched requests through the same error middleware", async () => {
    const response = await request(createTestApp(null)).get("/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Route not found",
      code: "ROUTE_NOT_FOUND",
    });
  });

  it("normalizes malformed JSON without exposing parser details", async () => {
    const app = express();
    app.use(express.json());
    app.post("/payload", (_req, res) => {
      res.sendStatus(204);
    });
    app.use(routeNotFound);
    app.use(errorHandler);

    const response = await request(app)
      .post("/payload")
      .set("Content-Type", "application/json")
      .send('{"broken"');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Request body contains invalid JSON",
      code: "INVALID_JSON",
    });
  });

  it("normalizes oversized uploads", async () => {
    const response = await request(
      createTestApp(new multer.MulterError("LIMIT_FILE_SIZE")),
    ).get("/failure");

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      error: "Uploaded content is too large",
      code: "UPLOAD_TOO_LARGE",
    });
  });
});
