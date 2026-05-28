import { Router } from "express";
import { contextService } from "./contexts-service.js";
import { db } from "../../database/index.js";
import path from "node:path";
import multer from "multer";
import { UPLOAD_PATH } from "../../config/uploads.js";
import { randomUUID } from "node:crypto";
import type { uploadedFile } from "../../database/types.js";
import type { UUID } from "node:crypto";

export const contextsRouter = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: (_req, file, callback) => {
      const fileExt = path.extname(file.originalname);
      callback(null, `${randomUUID()}${fileExt}`);
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
): uploadedFile[] => {
  return files.map((file): uploadedFile => {
    return {
      fileName: file.filename,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      originalName: file.originalname,
    };
  });
};

contextsRouter.get("/contexts/:id", async (req, res) => {
  const contextId = req.params.id as unknown as UUID;
  const context = await contextService.findOne(db, contextId);
  res.json(context);
});

contextsRouter.post(
  "/contexts",
  upload.array("files", 50),
  async (req, res) => {
    const prompt = req.body?.prompt ?? null;
    const presentationId = req.body?.presentationId ?? null;
    if (!prompt || !presentationId) {
      throw new Error("prompt and presentationId are required");
    }
    const newFiles = serializeFilesForInsert(
      req.files as Express.Multer.File[],
    );
    const createdContext = await contextService.create(
      db,
      { prompt, presentationId },
      newFiles,
    );
    res.status(201).json(createdContext);
  },
);

contextsRouter.put(
  "/contexts/:id",
  upload.array("files", 50),
  async (req, res) => {
    const contextId = req.params.id as string;
    const prompt = (req.body?.prompt ?? "") as string;
    const deletedFilesNames = Array.isArray(req.body?.deletedFilesNames)
      ? req.body.deletedFilesNames
      : [];
    const newFiles = serializeFilesForInsert(
      (req.files ?? []) as Express.Multer.File[],
    );
    const updatedContext = await contextService.update(
      db,
      {
        id: contextId,
        prompt,
      },
      newFiles,
      deletedFilesNames as string[],
    );

    res.json(updatedContext);
  },
);
