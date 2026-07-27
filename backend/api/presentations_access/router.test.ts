import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { UUID } from "node:crypto";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../errors/http-error.js";

const getPublicPresentation = vi.fn();
const grantAccess = vi.fn();

vi.mock("./presentations_access-service.js", () => ({
  accessService: {
    getPublicPresentation,
    grantAccess,
    listGrants: vi.fn(),
    removeGrant: vi.fn(),
    getShareLinkStatus: vi.fn(),
    createOrRotateShareLink: vi.fn(),
    revokeShareLink: vi.fn(),
  },
}));

const { presentationsAccessRouter, publicPresentationShareRouter } =
  await import("./router.js");

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/public", publicPresentationShareRouter);
  app.use(
    "/authenticated",
    (req, _res, next) => {
      req.authenticatedUserId = "requester" as UUID;
      next();
    },
    presentationsAccessRouter,
  );
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as HttpError;
    res.status(error.status ?? 500).json({ error: error.message });
  });
  return app;
};

describe("presentation access HTTP interface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redeems an anonymous token from a header without caching the response", async () => {
    getPublicPresentation.mockResolvedValue({
      title: "Shared deck",
      slides: [{ id: "slide", content: "# Hello", slideOrder: 1 }],
    });

    const response = await request(createTestApp())
      .get("/public/presentation")
      .set("X-Share-Token", "a".repeat(43));

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({
      title: "Shared deck",
      slides: [{ id: "slide", content: "# Hello", slideOrder: 1 }],
    });
    expect(getPublicPresentation).toHaveBeenCalledWith(
      expect.anything(),
      "a".repeat(43),
    );
  });

  it("prevents caching an unavailable share response", async () => {
    getPublicPresentation.mockRejectedValue(
      new HttpError(404, "Shared presentation is unavailable", "SHARE_UNAVAILABLE"),
    );

    const response = await request(createTestApp())
      .get("/public/presentation")
      .set("X-Share-Token", "invalid");

    expect(response.status).toBe(404);
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("rejects a grant with an invalid permission before touching persistence", async () => {
    const response = await request(createTestApp())
      .post("/authenticated/presentations/presentation/access")
      .send({ email: "viewer@example.com", permission: "manager" });

    expect(response.status).toBe(400);
    expect(grantAccess).not.toHaveBeenCalled();
  });
});
