import { randomUUID, UUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import type {
  Context,
  File,
  contextInsert,
  contextUpdate,
  fileInsert,
} from "../../database/types.js";
import type { Pool, PoolConnection } from "mysql2/promise";
import { fileService } from "../files/files-service.js";
import { runTransaction } from "../../database/index.js";

type ContextCreateResult = {
  context: Context;
  files: File[];
};

type ContextUpdateResult = {
  context: contextUpdate;
  newFiles: File[];
  deletedFilesIds: UUID[];
};

const createTransaction = async (
  db: Pool,
  context: contextInsert,
  files: fileInsert[],
): Promise<ContextCreateResult> => {
  return runTransaction(db, create, context, files);
};

const create = async (
  db: PoolConnection | Pool,
  context: contextInsert,
  files: fileInsert[],
): Promise<ContextCreateResult> => {
  const contextId = randomUUID();
  const query = SQL`insert into contexts (id, prompt, presentation_id) values (${contextId}, ${context.prompt}, ${context.presentationId})`;
  await db.query(query);
  const createdFiles = files.map((file) => ({
    ...file,
    contextId,
  }));
  const createdFileRows =
    createdFiles.length > 0
      ? await fileService.createMany(db, createdFiles)
      : [];
  return {
    context: {
      id: contextId,
      prompt: context.prompt,
      presentationId: context.presentationId,
    },
    files: createdFileRows,
  };
};

const updateTransaction = async (
  db: Pool,
  prompt: contextUpdate,
  newFiles: fileInsert[],
  deletedFilesIds: UUID[],
): Promise<ContextUpdateResult> => {
  // lezmni n8zer lel files el jdod nzidhom w el na9sin ne7ihom
  // createMany(db,newFiles)
  return runTransaction(db, update, prompt, newFiles, deletedFilesIds);
};
const update = async (
  db: PoolConnection | Pool,
  contextUpdate: contextUpdate,
  newFiles: fileInsert[],
  deletedFilesIds: UUID[],
): Promise<ContextUpdateResult> => {
  const query = SQL`update contexts set prompt=${contextUpdate.prompt} where id=${contextUpdate.id}`;
  await db.query(query);
  const createdFiles = newFiles.map((file) => ({
    ...file,
    contextId: contextUpdate.id,
  }));
  const createdFileRows =
    createdFiles.length > 0
      ? await fileService.createMany(db, createdFiles)
      : [];
  await fileService.deleteMany(db, deletedFilesIds);
  return {
    context: contextUpdate,
    newFiles: createdFileRows,
    deletedFilesIds,
  };
};

export const contextService = {
  create: createTransaction,
  update: updateTransaction,
};
