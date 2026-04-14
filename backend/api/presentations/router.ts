import  { Router }  from "express";
import type { Request } from "express";
import type { UUID } from "node:crypto";
import jsonwebtoken from "jsonwebtoken";
import { presentationsService } from "./presentations-service.js";
export const presentationsRouter = Router();
import { pool } from "../../database/index.js";

function getAuthenticatedUser(req: Request): { id: UUID } {
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

  return { id: payload.sub as UUID };
}

presentationsRouter.get("/presentations", async (req, res) => {
  const user = getAuthenticatedUser(req);
  res.json(await presentationsService.findMany(pool, user.id));
});

presentationsRouter.get("/presentation/:id", async (req, res) => {
  const user = getAuthenticatedUser(req);
  const presentationId = req.params.id;
  res.json(
    await presentationsService.findOneDetailed(pool, user.id, presentationId),
  );
});

presentationsRouter.post("/presentation", async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { title } = req.body;
  const createdPresentation = await presentationsService.create(pool, {
    title: title,
    userId: user.id,
  });
  res.status(201).json(createdPresentation);
});

presentationsRouter.delete("/presentation/:id", async (req, res) => {
  const user = getAuthenticatedUser(req);
  const presentationId = req.params.id;
  res.json(await presentationsService.remove(pool, user.id, presentationId));
});
