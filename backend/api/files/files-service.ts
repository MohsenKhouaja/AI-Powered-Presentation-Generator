import * as fs from "node:fs/promises";
import path from "node:path";
import { and, eq, inArray } from "drizzle-orm";
import type { DBContext } from "../../database/index.js";
import { files as filesTable } from "../../database/drizzle/schema.js";
import type { NewFileRow } from "../../database/types.js";
import { UPLOAD_PATH } from "../../config/uploads.js";

const createMany = async (db: DBContext, files: NewFileRow[]) => {
  if (files.length === 0) return [];
  await db.insert(filesTable).values(files);
  return files;
};

const deleteManyByIds = async (
  db: DBContext,
  contextId: string,
  fileIds: string[],
) => {
  if (fileIds.length === 0) return [];

  const rows = await db.query.files.findMany({
    where: { contextId, id: { in: fileIds } },
    columns: { id: true, fileName: true },
  });
  if (rows.length === 0) return [];

  await db.delete(filesTable).where(
    and(
      eq(filesTable.contextId, contextId),
      inArray(
        filesTable.id,
        rows.map((row) => row.id),
      ),
    ),
  );

  await Promise.all(
    rows.map((row) =>
      fs.rm(path.join(UPLOAD_PATH, row.fileName), { force: true }),
    ),
  );
  return rows.map((row) => row.id);
};

export const fileService = {
  createMany,
  deleteManyByIds,
} as const;
