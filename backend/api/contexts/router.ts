import { Router } from "express";
import { contextService } from "./contexts-service.js";
import { pool } from "../../database/index.js";
import path from "node:path";
import multer from "multer";
import { UPLOAD_PATH } from "../../app.js";
import { randomUUID, UUID } from "node:crypto";
import type { Express } from "express";
import { fileInsert } from "../../database/types.js";
import { rm } from "node:fs/promises";

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
  contextId: UUID,
): fileInsert[] => {
  return files.map((file) => ({
    id: file.filename,
    originalname: file.originalname,
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
    const { prompt } = req.body;
    const newFiles = serializeFilesForInsert(req.files ?? [], contextId);
    const createdContext = await contextService.create(pool, prompt, newFiles);
    res.status(201).json(createdContext);
  },
);

/**
 * Deletes multiple files concurrently.
 * @param {string[]} filePaths - Array of absolute or relative paths.
 */
async function deleteManyFiles(filePaths) {
  try {
    // Map each path to a promise and wait for all to complete
    const deletePromises = filePaths.map(path => 
      rm(path, { force: true, recursive: true })
    );

    await Promise.all(deletePromises);
    console.log(`Successfully processed ${filePaths.length} files.`);
  } catch (error) {
    console.error("Batch deletion failed:", error);
  }
}

contextsRouter.put(
  "/contexts/:id",
  upload.array("files", 50),
  async (req, res) => {
    const contextId = req.params.id;
    const { prompt, deletedFilesIds = [] } = req.body;
    const newFiles = serializeFilesForInsert(req.files ?? [], contextId);
    await deleteManyFiles(
      deletedFilesIds.map((fileId) => path.join(UPLOAD_PATH, fileId)),
    );
    const updatedContext = await contextService.update(
      pool,
      {
        id: contextId,
        prompt,
      },
      newFiles,
      deletedFilesIds,
    );

    res.json(updatedContext);
  },
);
