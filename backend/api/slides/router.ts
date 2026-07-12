import { Router } from "express";
import type { UUID } from "node:crypto";
import { db } from "../../database/index.js";
import { slidesService } from "./slides-service.js";

export const slidesRouter = Router();

slidesRouter.get("/presentations/:presentationId/slides", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  const presentationId = req.params.presentationId as UUID;
  const slides = await slidesService.findMany(db, userId, presentationId);
  res.json(slides);
});

/* 
slidesRouter.get(
  "/presentations/:presentationId/slides/:slideId",
  async (req, res) => {
    const userId = req.authenticatedUserId as UUID;
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
 */
slidesRouter.post("/presentations/:presentationId/slides", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
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
// frontendAgent the generate button should be in the context creation page and should be disabled if the context is not saved to the backend yet , when i click them route me to the presentation page and show loading
slidesRouter.post(
  "/presentations/:presentationId/slides/generate",
  async (req, res) => {
    const userId = req.authenticatedUserId as UUID;
    const presentationId = req.params.presentationId as UUID;
    const contextId =
      typeof req.body?.contextId === "string"
        ? (req.body.contextId as UUID)
        : null;

    const numSlidesRaw = req.body?.numSlides;
    const numSlides =
      typeof numSlidesRaw === "number" ? Math.trunc(numSlidesRaw) : undefined;

    if (!contextId) {
      res.status(400).json({ error: "contextId is required" });
      return;
    }

    if (
      typeof numSlides !== "undefined" &&
      (!Number.isFinite(numSlides) || numSlides < 1 || numSlides > 50)
    ) {
      res
        .status(400)
        .json({ error: "numSlides must be an integer between 1 and 50" });
      return;
    }

    const generatedSlides = await slidesService.generateFromContext(
      db,
      userId,
      presentationId,
      contextId,
      numSlides,
    );

    res.status(201).json(generatedSlides);
  },
);
// frontendAgent when i click ctrl+s or the save button in the presentation page this endpoint is called to update the content of the slide and show the updated content in the UI
slidesRouter.put(
  "/presentations/:presentationId/slides/:slideId",
  async (req, res) => {
    const userId = req.authenticatedUserId as UUID;
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
    const userId = req.authenticatedUserId as UUID;
    const presentationId = req.params.presentationId as UUID;
    const slideId = req.params.slideId as UUID;

    const result = await slidesService.removeOne(
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
    const userId = req.authenticatedUserId as UUID;
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
