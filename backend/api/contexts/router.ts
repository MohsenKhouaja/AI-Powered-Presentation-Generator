import { Router } from "express";
import { contextService } from "./contexts-service.js";
import { db } from "../../database/index.js";
import path from "node:path";
import multer from "multer";
import { UPLOAD_PATH } from "../../config/uploads.js";
import { randomUUID } from "node:crypto";
import type { Express } from "express";
import type { UUID } from "node:crypto";
import type { fileInsert } from "../../database/types.js";

export const contextsRouter = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}-${path.extname(file.originalname)}`);
    },
  }),
  limits: {
    files: 50,
    fileSize: Number(
      process.env.MAX_UPLOAD_FILE_SIZE_BYTES || 50 * 1024 * 1024,
    ),
  },
});

const serializeFilesForInsert = (
  files: Express.Multer.File[],
  contextId: string,
): fileInsert[] => {
  return files.map((file) => ({
    id: file.filename,
    originalName: file.originalname,
    storageKey: file.filename,
    mimeType: file.mimetype,
    fileType: "attachment",
    sizeBytes: file.size,
    contextId,
  }));
};

contextsRouter.post(
  "/contexts",
  upload.array("files", 50),
  async (req, res) => {
    const contextId = randomUUID();
    const prompt = req.body?.prompt ?? "";
    const newFiles = serializeFilesForInsert(req.files ?? [], contextId);
    const createdContext = await contextService.create(db, prompt, newFiles);
    res.status(201).json(createdContext);
  },
);

contextsRouter.put(
  "/contexts/:id",
  upload.array("files", 50),
  async (req, res) => {
    const contextId = req.params.id;
    const prompt = req.body?.prompt ?? "";
    const deletedFilesIds = Array.isArray(req.body?.deletedFilesIds)
      ? req.body.deletedFilesIds
      : [];
    const newFiles = serializeFilesForInsert(req.files ?? [], contextId);
    const updatedContext = await contextService.update(
      db,
      {
        id: contextId,
        prompt,
      },
      newFiles,
      deletedFilesIds as UUID[],
    );

    res.json(updatedContext);
  },
);
