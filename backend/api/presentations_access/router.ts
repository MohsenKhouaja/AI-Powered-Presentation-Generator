import { Router } from "express";
import type { UUID } from "node:crypto";
import { accessService } from "./presentations_access-service.js";
import { db } from "../../database/index.js";

export const presentationsAccessRouter = Router();
/* 
presentationsAccessRouter.get("/presentations/:id/access", async (req, res) => {
  const requesterId = req.authenticatedUserId as UUID;
  const presentationId = req.params.id;
  const accessList = await accessService.getPresentationAccess(
    db,
    requesterId,
    presentationId as UUID,
  );
  res.json(accessList);
});
 */
presentationsAccessRouter.post(
  "/presentations/:id/access",
  async (req, res) => {
    const userId = req.authenticatedUserId as UUID;
    const presentationId = req.params.id;
    const email =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const expiresAtInput = req.body?.expiresAt;
    const parsedExpiresAt =
      typeof expiresAtInput === "string" && expiresAtInput.length > 0
        ? new Date(expiresAtInput)
        : undefined;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    if (parsedExpiresAt && Number.isNaN(parsedExpiresAt.getTime())) {
      res.status(400).json({ error: "Invalid expiresAt value" });
      return;
    }

    const grantedAccess = await accessService.grantAccess(db, userId, {
      email,
      presentationId,
      expiresAt: parsedExpiresAt,
    });

    res.status(201).json(grantedAccess);
  },
);
/* 
presentationsAccessRouter.delete("/access/:id", async (req, res) => {
  const userId = req.authenticatedUserId as UUID;
  const accessId = req.params.id;

  const removed = await accessService.removeAccess(
    db,
    userId,
    accessId as UUID,
  );
  res.json(removed);
});

presentationsAccessRouter.post(
  "/presentations/:id/share-link",
  async (req, res) => {
    const userId = req.authenticatedUserId as UUID;
    const presentationId = req.params.id;
    const shareLink = await accessService.createShareLink(
      db,
      userId,
      presentationId as UUID,
    );

    res.json(shareLink);
  },
);
 */
