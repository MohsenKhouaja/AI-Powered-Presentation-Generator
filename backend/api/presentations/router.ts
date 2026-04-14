import { Router } from "express";
import type { Request } from "express";
import type { UUID } from "node:crypto";
import jsonwebtoken from "jsonwebtoken";
import { presentationsService } from "./presentations-service.js";
export const presentationsRouter = Router();
import { pool } from "../../database/index.js";

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
presentationsRouter.get("/presentations", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  res.json(await presentationsService.findMany(pool, userId));
});

presentationsRouter.get("/presentation/:id", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const presentationId = req.params.id;
  res.json(
    await presentationsService.findOneDetailed(pool, userId, presentationId),
  );
});

presentationsRouter.post("/presentation", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const { title } = req.body;
  const createdPresentation = await presentationsService.create(pool, {
    title: title,
    userId: userId,
  });
  res.status(201).json(createdPresentation);
});

presentationsRouter.delete("/presentation/:id", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  const presentationId = req.params.id;
  res.json(await presentationsService.remove(pool, userId, presentationId));
});
