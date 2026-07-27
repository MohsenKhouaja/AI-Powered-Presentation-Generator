import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { requirePresentationAccess } from "../../authorization/presentation-authorization.js";
import { UPLOAD_PATH } from "../../config/uploads.js";
import type { DBContext } from "../../database/index.js";
import { contexts } from "../../database/drizzle/schema.js";
import type {
  ContextRow,
  ContextWithFilesRow,
  NewContextRow,
  NewFileRow,
  uploadedFile,
} from "../../database/types.js";
import { HttpError, notFound } from "../../errors/http-error.js";
import { fileService } from "../files/files-service.js";

const loadContext = async (db: DBContext, contextId: UUID) => {
  const context = await db.query.contexts.findFirst({
    where: { id: contextId },
    with: { files: true },
  });
  if (!context) {
    throw notFound("Context not found", "CONTEXT_NOT_FOUND");
  }
  return context;
};

const requireContextAccess = async (
  db: DBContext,
  userId: UUID,
  contextId: UUID,
  action: "viewSources" | "editContent",
) => {
  const context = await db.query.contexts.findFirst({
    where: { id: contextId },
    columns: { presentationId: true },
  });
  if (!context) {
    throw notFound("Context not found", "CONTEXT_NOT_FOUND");
  }

  try {
    await requirePresentationAccess(db, {
      userId,
      presentationId: context.presentationId as UUID,
      action,
    });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      throw notFound("Context not found", "CONTEXT_NOT_FOUND");
    }
    throw error;
  }
  return context;
};

const findOne = async (
  db: DBContext,
  userId: UUID,
  contextId: UUID,
): Promise<ContextWithFilesRow> => {
  await requireContextAccess(db, userId, contextId, "viewSources");
  const context = await loadContext(db, contextId);
  const files = await Promise.all(
    context.files.map(async (file) => ({
      ...file,
      base64File: await fs.readFile(path.join(UPLOAD_PATH, file.fileName), {
        encoding: "base64",
      }),
    })),
  );

  return {
    id: context.id,
    prompt: context.prompt,
    presentationId: context.presentationId,
    files,
  };
};

const createForPresentation = async (
  db: DBContext,
  context: NewContextRow,
  files: uploadedFile[],
): Promise<ContextRow> => {
  const contextId = randomUUID();
  await db.insert(contexts).values({
    id: contextId,
    prompt: context.prompt ?? "",
    presentationId: context.presentationId,
  });

  const createdFiles: NewFileRow[] = files.map((file) => ({
    ...file,
    contextId,
  }));
  await fileService.createMany(db, createdFiles);

  return {
    id: contextId,
    prompt: context.prompt ?? "",
    presentationId: context.presentationId,
  };
};

const update = async (
  db: DBContext,
  userId: UUID,
  contextId: UUID,
  prompt: string,
  newFiles: uploadedFile[],
  deletedFileIds: string[],
) => {
  const contextAccess = await requireContextAccess(
    db,
    userId,
    contextId,
    "editContent",
  );

  return await db.transaction(async (tx) => {
    await tx.update(contexts).set({ prompt }).where(eq(contexts.id, contextId));

    const createdFiles: NewFileRow[] = newFiles.map((file) => ({
      ...file,
      contextId,
    }));
    await fileService.createMany(tx, createdFiles);
    const removedFileIds = await fileService.deleteManyByIds(
      tx,
      contextId,
      deletedFileIds,
    );

    return {
      context: {
        id: contextId,
        prompt,
        presentationId: contextAccess.presentationId,
      },
      newFiles: createdFiles,
      deletedFileIds: removedFileIds,
    };
  });
};

export const contextService = {
  requireContextAccess,
  findOne,
  createForPresentation,
  update,
} as const;
