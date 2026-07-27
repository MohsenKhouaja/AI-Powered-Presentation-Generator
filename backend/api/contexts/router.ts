import path from "node:path";
import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { UPLOAD_PATH } from "../../config/uploads.js";
import { db } from "../../database/index.js";
import type { uploadedFile } from "../../database/types.js";
import { badRequest } from "../../errors/http-error.js";
import { contextService } from "./contexts-service.js";

export const contextsRouter = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
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
): uploadedFile[] =>
  files.map((file) => ({
    fileName: file.filename,
    mimeType: file.mimetype,
    sizeBytes: file.size,
    originalName: file.originalname,
  }));

const parseDeletedFileIds = (value: unknown): string[] => {
  if (value === undefined || value === null || value === "") return [];
  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value) as unknown;
          } catch {
            throw badRequest(
              "deletedFileIds must be a JSON array",
              "INVALID_DELETED_FILE_IDS",
            );
          }
        })()
      : value;

  if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === "string")) {
    throw badRequest(
      "deletedFileIds must be a JSON array of file IDs",
      "INVALID_DELETED_FILE_IDS",
    );
  }
  return parsed;
};

contextsRouter.get("/contexts/:id", async (req, res) => {
  res.json(
    await contextService.findOne(
      db,
      req.authenticatedUserId as UUID,
      req.params.id as UUID,
    ),
  );
});

contextsRouter.put(
  "/contexts/:id",
  async (req, _res, next) => {
    await contextService.requireContextAccess(
      db,
      req.authenticatedUserId as UUID,
      req.params.id as UUID,
      "editContent",
    );
    next();
  },
  upload.array("files", 50),
  async (req, res) => {
    const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
    const result = await contextService.update(
      db,
      req.authenticatedUserId as UUID,
      req.params.id as UUID,
      prompt,
      serializeFilesForInsert((req.files ?? []) as Express.Multer.File[]),
      parseDeletedFileIds(req.body?.deletedFileIds),
    );
    res.json(result);
  },
);
