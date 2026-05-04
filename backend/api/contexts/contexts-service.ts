import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import type {
  Context,
  File,
  contextInsert,
  contextUpdate,
  fileInsert,
} from "../../database/types.js";
import { fileService } from "../files/files-service.js";
import type { DBContext } from "../../database/index.js";
import { contexts } from "../../database/drizzle/schema.js";
import { eq } from "drizzle-orm";

type ContextUpdateResult = {
  context: contextUpdate;
  newFiles: File[];
  deletedFilesIds: UUID[];
};

const findOne = async (
  db: DBContext,
  contextId: UUID,
): Promise<Context | null> => {
  const contextRow = await db.query.contexts.findFirst({
    where: eq(contexts.id, contextId),
    with: {
      files: true,
    },
  });
  if (!contextRow) {
    return null;
  }
};

const create = async (
  db: DBContext,
  context: contextInsert,
  files: fileInsert[],
): Promise<Context> => {
  const contextId = randomUUID();
  return await db.transaction(async (tx) => {
    await tx.insert(contexts).values({
      id: contextId,
      prompt: context.prompt,
    });
    const createdFiles = files.map((file) => ({
      ...file,
      contextId,
    }));
    const createdFileRows =
      createdFiles.length > 0
        ? await fileService.createMany(tx, createdFiles)
        : [];
    return {
      id: contextId,
      prompt: context.prompt,
      presentationId: null,
      files: createdFileRows,
    };
  });
};

const update = async (
  db: DBContext,
  contextUpdate: contextUpdate,
  newFiles: fileInsert[],
  deletedFilesIds: UUID[],
): Promise<ContextUpdateResult> => {
  return await db.transaction(async (tx) => {
    await tx
      .update(contexts)
      .set({ prompt: contextUpdate.prompt })
      .where(eq(contexts.id, contextUpdate.id));
    const createdFiles = newFiles.map((file) => ({
      ...file,
      contextId: contextUpdate.id,
    }));
    const createdFileRows =
      createdFiles.length > 0
        ? await fileService.createMany(tx, createdFiles)
        : [];
    await fileService.deleteMany(tx, deletedFilesIds);
    return {
      context: contextUpdate,
      newFiles: createdFileRows,
      deletedFilesIds,
    };
  });
};

export const contextService = {
  create,
  update,
};
