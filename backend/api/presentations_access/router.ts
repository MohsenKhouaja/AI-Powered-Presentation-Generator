import { Router } from "express";
import type { Request } from "express";
import type { UUID } from "node:crypto";
import jsonwebtoken from "jsonwebtoken";
import { accessService } from "./presentations_access-service.js";
import { pool } from "../../database/index.js";

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

presentationsAccessRouter.get("/presentations/:id/access", async (req, res) => {
  const presentationId = req.params.id;
  const accessList = await accessService.getPresentationAccess(
    pool,
    presentationId,
  );
  res.json(accessList);
});

presentationsAccessRouter.post(
  "/presentations/:id/access",
  async (req, res) => {
    const userId = getAuthenticatedUserId(req);
    const presentationId = req.params.id;
    const { email, expiresAt } = req.body;

    const grantedAccess = await accessService.grantAccess(pool, userId, {
      email,
      presentationId,
      expiresAt,
    });

    res.status(201).json(grantedAccess);
  },
);
