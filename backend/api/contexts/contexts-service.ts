import { UUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import type {
  contextInsert,
  contextUpdate,
  fileInsert,
} from "../../database/types.js";
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

const updateTransaction = async (
  db: Pool,
  prompt: contextUpdate,
  newFiles: fileInsert[],
  deletedFilesIds: UUID[],
) => {
  // lezmni n8zer lel files el jdod nzidhom w el na9sin ne7ihom
  // createMany(db,newFiles)
  runTransaction(db, update, prompt, newFiles, deletedFilesIds);
};
const update = async (
  db: PoolConnection,
  contextUpdate: contextUpdate,
  newFiles: fileInsert[],
  deletedFilesIds: UUID[],
) => {
  const query = SQL`update contexts set prompt=${contextUpdate.prompt} where id=${contextUpdate.id}`;
  await db.query(query);
  await fileService.createMany(db, newFiles);
  await fileService.deleteMany(db, deletedFilesIds);
};

export const contextService = {
  create: createTransaction,
  update: updateTransaction,
};
