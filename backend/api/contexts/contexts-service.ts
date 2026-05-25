import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { fileService } from "../files/files-service.js";
import type { DBContext } from "../../database/index.js";
import { contexts } from "../../database/drizzle/schema.js";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import { UPLOAD_PATH } from "../../config/uploads.js";
import path from "node:path";
import type {
  ContextRow,
  ContextWithFilesRow,
  NewContextRow,
  NewFileRow,
  uploadedFile,
} from "../../database/types.js";

const findOne = async (
  db: DBContext,
  contextId: UUID,
): Promise<ContextWithFilesRow> => {
  const context = await db.query.contexts.findFirst({
    where: { id: contextId },
    with: {
      files: true,
    },
  });
  if (!context) {
    return null;
  }
  const files = await Promise.all(
    context.files.map(async (file) => {
      return {
        ...file,
        base64File: await fs.readFile(path.join(UPLOAD_PATH, file.fileName), {
          encoding: "base64",
        }),
      };
    }),
  );
  const contextWithfiles = {
    id: context.id,
    prompt: context.prompt,
    presentationId: context.presentationId,
    files: files,
  };
  return contextWithfiles;
};

const create = async (
  db: DBContext,
  context: NewContextRow,
  files: uploadedFile[],
): Promise<ContextRow> => {
  const contextId = randomUUID() as string;
  return await db.transaction(async (tx) => {
    await tx.insert(contexts).values({
      id: contextId,
      prompt: context.prompt,
      presentationId: context.presentationId,
    });
    const createdFiles = files.map(
      (file): NewFileRow => ({
        ...file,
        contextId,
      }),
    );
    const createdFileRows =
      createdFiles.length > 0
        ? await fileService.createMany(tx, createdFiles)
        : [];
    return {
      id: contextId,
      prompt: context.prompt,
      presentationId: context.presentationId,
      files: createdFileRows,
    };
  });
};

const update = async (
  db: DBContext,
  contextUpdate: Partial<ContextRow>,
  newFiles: uploadedFile[],
  deletedFilesNames: string[],
) => {
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
    await fileService.deleteMany(tx, deletedFilesNames);
    return {
      context: contextUpdate,
      newFiles: newFiles.map((file) => ({ filename: file.fileName })),
      deletedFilesNames,
    };
  });
};

export const contextService = {
  findOne,
  create,
  update,
};
