import * as fs from "fs/promises";
import type { UUID } from "node:crypto";
import type { DBContext } from "../../database/index.js";
import { files as filesTable } from "../../database/drizzle/schema.js";
import { inArray } from "drizzle-orm";
import path from "node:path";
import { UPLOAD_PATH } from "../../config/uploads.js";
import type { FileRow, NewFileRow } from "../../database/types.js";

const createMany = async (db: DBContext, files: NewFileRow[]) => {
  await db.insert(filesTable).values(files);
};

const deleteMany = async (db: DBContext, fileNames: string[]) => {
  if (fileNames.length === 0) return;

  await db.delete(filesTable).where(inArray(filesTable.fileName, fileNames));

  await Promise.all(
    fileNames.map((fileName) =>
      fs.rm(path.join(UPLOAD_PATH, fileName), { force: true, recursive: true }),
    ),
  );
};

export const fileService = {
  createMany: createMany,
  deleteMany: deleteMany,
};
