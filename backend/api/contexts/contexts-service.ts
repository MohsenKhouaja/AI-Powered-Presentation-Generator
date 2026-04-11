import { randomUUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import type { contextInsert, fileInsert } from "../../database/types.js";
import type { Pool, PoolConnection } from "mysql2/promise";
import { fileService } from "../files/files-service.js";
import { runTransaction } from "../../database/index.js";
const createTransaction = async (
  db: Pool,
  context: contextInsert,
  files: fileInsert[],
) => {
  runTransaction(db, create, context, files);
};

const create = async (
  db: PoolConnection,
  context: contextInsert,
  files: fileInsert[],
): Promise<void> => {
  const query = SQL`insert into contexts (id, prompt, presentation_id) values (${context.id}, ${context.prompt}, ${context.presentationId})`;
  await db.query(query);
  if (files.length > 0) {
    await fileService.createMany(db, files);
  }
};

export const contextService = {
  create: createTransaction,
};
