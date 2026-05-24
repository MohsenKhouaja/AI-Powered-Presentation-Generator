import { Router } from "express";
import type { Request } from "express";
import type { UUID } from "node:crypto";
import jsonwebtoken from "jsonwebtoken";
import { db } from "../../database/index.js";
import { slidesService } from "./slides-service.js";

export const slidesRouter = Router();

function getAuthenticatedUserId(req: Request): UUID {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized, token missing");
  }
  const token = authHeader.split(" ")[1];
  const payload = jsonwebtoken.verify(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY as string,
  ) as { sub?: string };

  if (!payload.sub) {
    throw new Error("Unauthorized, invalid token payload");
  }

  return payload.sub as UUID;
}

slidesRouter.get("/presentations/:presentationId/slides", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const presentationId = req.params.presentationId as UUID;
  const slides = await slidesService.findMany(db, userId, presentationId);
  res.json(slides);
});

slidesRouter.get(
  "/presentations/:presentationId/slides/:slideId",
  async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const presentationId = req.params.presentationId as UUID;
    const slideId = req.params.slideId as UUID;
    const slide = await slidesService.findOne(
      db,
      userId,
      presentationId,
      slideId,
    );
    res.json(slide);
  },
);

slidesRouter.post("/presentations/:presentationId/slides", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const presentationId = req.params.presentationId as UUID;
  const content = typeof req.body?.content === "string" ? req.body.content : "";
  const slideOrder =
    typeof req.body?.slideOrder === "number" ? req.body.slideOrder : undefined;

  if (!content.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  const createdSlide = await slidesService.create(db, userId, presentationId, {
    content,
    slideOrder,
  });

  res.status(201).json(createdSlide);
});

slidesRouter.put(
  "/presentations/:presentationId/slides/:slideId",
  async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const presentationId = req.params.presentationId as UUID;
    const slideId = req.params.slideId as UUID;
    const content: string =
      typeof req.body?.content === "string" ? req.body.content : "";

    if (!content.trim()) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    const updatedSlide = await slidesService.update(
      db,
      userId,
      presentationId,
      slideId,
      content,
    );

    res.json(updatedSlide);
  },
);

slidesRouter.delete(
  "/presentations/:presentationId/slides/:slideId",
  async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const presentationId = req.params.presentationId as UUID;
    const slideId = req.params.slideId as UUID;

    const result = await slidesService.remove(
      db,
      userId,
      presentationId,
      slideId,
    );
    res.json(result);
  },
);

slidesRouter.put(
  "/presentations/:presentationId/slides/order",
  async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const presentationId = req.params.presentationId as UUID;

    const first = req.body?.first;
    const second = req.body?.second;

    const updated = await slidesService.updateOrder(
      db,
      userId,
      presentationId,
      first,
      second,
    );

    res.json({ updated });
  },
);
