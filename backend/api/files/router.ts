import { Router } from "express";
import { fileService } from "./files-service.js";
import { pool } from "../../database/index.js";

export const filesRouter = Router();

filesRouter.post("/contexts/:id/files", async (req, res) => {
  const contextId = req.params.id;
  const { storageKey, mimeType, fileType, sizeBytes } = req.body;

  const createdFile = await fileService.createOne(pool, {
    contextId,
    storageKey,
    mimeType,
    fileType,
    sizeBytes,
  });

  res.status(201).json(createdFile);
});

filesRouter.post("/contexts/:id/files/batch", async (req, res) => {
  const contextId = req.params.id;
  const { files } = req.body;
  const filesToCreate = (files ?? []).map((file) => ({
    ...file,
    contextId,
  }));

  const createdFiles = await fileService.createMany(pool, filesToCreate);
  res.status(201).json(createdFiles);
});

filesRouter.delete("/files/:id", async (req, res) => {
  const fileId = req.params.id;
  await fileService.deleteMany(pool, [fileId]);
  res.json({ success: true });
});

filesRouter.delete("/files", async (req, res) => {
  const { fileIds = [] } = req.body;
  await fileService.deleteMany(pool, fileIds);
  res.json({ success: true });
});
