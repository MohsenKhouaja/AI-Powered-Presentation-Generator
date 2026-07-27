import express from "express";
import type { UUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../middleware/error-handler.js";

const { createPresentation, createSlide, generateSlides } = vi.hoisted(() => ({
  createPresentation: vi.fn(),
  createSlide: vi.fn(),
  generateSlides: vi.fn(),
}));

vi.mock("../database/index.js", () => ({ db: {} }));
vi.mock("./presentations/presentations-service.js", () => ({
  presentationsService: {
    findMany: vi.fn(),
    findOneDetailed: vi.fn(),
    create: createPresentation,
    updateTitle: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock("./slides/slides-service.js", () => ({
  slidesService: {
    findMany: vi.fn(),
    create: createSlide,
    generateFromContext: generateSlides,
    update: vi.fn(),
    removeOne: vi.fn(),
    updateOrder: vi.fn(),
  },
}));

const { presentationsRouter } = await import("./presentations/router.js");
const { slidesRouter } = await import("./slides/router.js");

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.authenticatedUserId = "user" as UUID;
    next();
  });
  app.use(presentationsRouter);
  app.use(slidesRouter);
  app.use(errorHandler);
  return app;
};

describe("presentation and slide validation errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a presentation title", async () => {
    const response = await request(createTestApp())
      .post("/presentation")
      .send({ title: "  " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Title is required",
      code: "PRESENTATION_TITLE_REQUIRED",
    });
    expect(createPresentation).not.toHaveBeenCalled();
  });

  it("requires slide content", async () => {
    const response = await request(createTestApp())
      .post("/presentations/presentation/slides")
      .send({ content: "" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Content is required",
      code: "SLIDE_CONTENT_REQUIRED",
    });
    expect(createSlide).not.toHaveBeenCalled();
  });

  it("requires a context before slide generation", async () => {
    const response = await request(createTestApp())
      .post("/presentations/presentation/slides/generate")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "contextId is required",
      code: "CONTEXT_ID_REQUIRED",
    });
    expect(generateSlides).not.toHaveBeenCalled();
  });

  it("validates the requested slide count", async () => {
    const response = await request(createTestApp())
      .post("/presentations/presentation/slides/generate")
      .send({ contextId: "context", numSlides: 51 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "numSlides must be an integer between 1 and 50",
      code: "INVALID_SLIDE_COUNT",
    });
    expect(generateSlides).not.toHaveBeenCalled();
  });
});
