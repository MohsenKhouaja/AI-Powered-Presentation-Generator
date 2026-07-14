import { Router } from "express";
import type { UUID } from "node:crypto";
import { presentationsService } from "./presentations-service.js";
export const presentationsRouter = Router();
import { db } from "../../database/index.js";

presentationsRouter.get("/presentations", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  res.json(await presentationsService.findMany(db, userId));
});

presentationsRouter.get("/presentation/:id", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  const presentationId = req.params.id;
  res.json(
    await presentationsService.findOneDetailed(
      db,
      userId,
      presentationId as UUID,
    ),
  );
});

presentationsRouter.post("/presentation", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  const title = req.body?.title ?? "";
  const createdPresentation = await presentationsService.create(db, {
    title: title,
    userId: userId,
  });
  res.status(201).json(createdPresentation);
});

presentationsRouter.put("/presentation/:id", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  const presentationId = req.params.id;

  const title =
    typeof req.body?.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  await presentationsService.updateTitle(
    db,
    userId,
    presentationId as UUID,
    title,
  );
  res.status(200).end();
});

presentationsRouter.delete("/presentation/:id", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  const presentationId = req.params.id;
  await presentationsService.remove(db, userId, presentationId as UUID);
  res.status(204).end();
});
