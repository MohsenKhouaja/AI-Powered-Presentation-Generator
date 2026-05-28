import { Router } from "express";
import type { Request } from "express";
import type { UUID } from "node:crypto";
import jsonwebtoken from "jsonwebtoken";
import { accessService } from "./presentations_access-service.js";
import { db } from "../../database/index.js";

export const presentationsAccessRouter = Router();
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
/* 
presentationsAccessRouter.get("/presentations/:id/access", async (req, res) => {
  const requesterId = getAuthenticatedUserId(req);
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
    const userId = getAuthenticatedUserId(req);
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
  const userId = getAuthenticatedUserId(req);
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
    const userId = getAuthenticatedUserId(req);
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
