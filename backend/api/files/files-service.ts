import * as fs from "fs/promises";
import type { UUID } from "node:crypto";
import type { File, fileInsert } from "../../database/types.js";
import type { DBContext } from "../../database/index.js";
import { files as filesTable } from "../../database/drizzle/schema.js";
import { inArray } from "drizzle-orm";
import { rm } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_PATH } from "../../config/uploads.js";

const createOne = async (db: DBContext, file: fileInsert): Promise<File> => {
  await db.insert(filesTable).values({
    id: file.id,
    contextId: file.contextId,
    storageKey: file.storageKey,
    mimeType: file.mimeType,
    fileType: file.fileType,
    sizeBytes: file.sizeBytes,
    originalName: file.originalName,
  });
  return {
    id: file.id,
    contextId: file.contextId,
    originalName: file.originalName,
    storageKey: file.storageKey,
    mimeType: file.mimeType,
    fileType: file.fileType,
    sizeBytes: file.sizeBytes,
  };
};

const createMany = async (
  db: DBContext,
  files: fileInsert[],
): Promise<File[]> => {
  if (files.length === 0) return [];
  await db.insert(filesTable).values(files);
  return files;
};

const deleteMany = async (db: DBContext, fileIds: UUID[]) => {
  if (fileIds.length === 0) return;

  await db.delete(filesTable).where(inArray(filesTable.id, fileIds));

  await Promise.all(
    fileIds.map((fileId) =>
      rm(path.join(UPLOAD_PATH, fileId), { force: true, recursive: true }),
    ),
  );
};

export const fileService = {
  createOne: createOne,
  createMany: createMany,
  deleteMany: deleteMany,
};
