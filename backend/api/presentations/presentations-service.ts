import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";

import type { DBContext } from "../../database/index.js";
import { presentations, slides } from "../../database/drizzle/schema.js";
import { eq } from "drizzle-orm";
import { mongoDB } from "../../database/index.js";
import type {
  NewPresentationRow,
  presentationDetail,
  PresentationRow,
  SlideRow,
} from "../../database/types.js";
import { contextService } from "../contexts/contexts-service.js";
import { slidesService } from "../slides/slides-service.js";

type SlideContentDocument = {
  _id: string;
  slide_content: string;
};

const slidesContentCollection =
  mongoDB.collection<SlideContentDocument>("slides_content");

const hasActiveEditAccess = async (
  db: DBContext,
  presentationId: UUID,
  userId: UUID,
): Promise<boolean> => {
  const activeEditAccess = await db.query.editAccess.findFirst({
    where: {
      presentationId,
      userId,
      OR: [{ expiresAt: { isNull: true } }, { expiresAt: { gt: new Date() } }],
    },
    columns: { id: true },
  });

  return Boolean(activeEditAccess);
};

const findMany = async (
  db: DBContext,
  userId: UUID,
): Promise<PresentationRow[]> => {
  const ownedPresentationRows: PresentationRow[] =
    await db.query.presentations.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  const ownedPresentations: PresentationRow[] = ownedPresentationRows.map(
    (row) => ({
      id: row.id,
      title: row.title,
      userId: row.userId as UUID,
      createdAt: row.createdAt,
      AccessType: "own" as const,
    }),
  );

  const editPresentationIds = await db.query.editAccess.findMany({
    where: { userId },
    columns: { presentationId: true },
  });
  const editPresentationIdsArray: string[] = editPresentationIds.map(
    (elm) => elm.presentationId,
  );

  const editPresentationRows: PresentationRow[] =
    editPresentationIdsArray.length > 0
      ? await db.query.presentations.findMany({
          where: { id: { in: editPresentationIdsArray } },
          orderBy: { createdAt: "desc" },
        })
      : [];
  const editPresentations: PresentationRow[] = editPresentationRows.map(
    (row) => ({
      id: row.id,
      title: row.title,
      userId: row.userId as UUID,
      createdAt: row.createdAt,
      AccessType: "edit" as const,
    }),
  );

  return [...ownedPresentations, ...editPresentations];
};

const findOneDetailed = async (
  db: DBContext,
  userID: UUID,
  presentationId: UUID,
): Promise<presentationDetail> => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { id: true, title: true, userId: true, createdAt: true },
    with: {
      slides: {
        orderBy: { slideOrder: "asc" },
      },
      contexts: true,
    },
  });

  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  const isOwner = presentationRow.userId === userID;

  let accessType: "own" | "edit";
  if (isOwner) {
    accessType = "own";
  } else {
    const canEdit = await hasActiveEditAccess(db, presentationId, userID);
    if (!canEdit) {
      throw new Error("user unauthorized to access this presentation");
    }
    accessType = "edit";
  }

  const slideRows: SlideRow[] = presentationRow.slides ?? [];
  const slideContentDocs =
    slideRows.length > 0
      ? await slidesContentCollection
          .find({ _id: { $in: slideRows.map((slide) => slide.id) } })
          .toArray()
      : [];

  const slideContentMap = new Map<string, string>(
    slideContentDocs.map((doc) => [doc._id, doc.slide_content]),
  );

  const contextRow = await contextService.findOne(
    db,
    presentationRow.contexts.id as UUID,
  );

  const detail = {
    id: presentationRow.id,
    title: presentationRow.title,
    userId: presentationRow.userId as UUID,
    createdAt: presentationRow.createdAt,
    slides: slideRows.map((row) => ({
      id: row.id,
      content: slideContentMap.get(row.id),
      presentationId: row.presentationId,
      slideOrder: row.slideOrder,
    })),
    context: contextRow,
    AccessType: accessType,
  };

  return detail;
};

const create = async (
  db: DBContext,
  presentation: NewPresentationRow,
): Promise<PresentationRow> => {
  const presentationId = randomUUID();
  const createdAt = new Date();
  await db.insert(presentations).values({
    id: presentationId,
    title: presentation.title,
    userId: presentation.userId,
    createdAt,
  });
  return {
    id: presentationId,
    title: presentation.title,
    userId: presentation.userId,
    createdAt,
  };
};

const remove = async (db: DBContext, userId: UUID, presentationId: UUID) => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { userId: true },
  });
  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }
  if (presentationRow.userId !== userId) {
    throw new Error("user not authorized to delete this presentation");
  }
  await db.transaction(async (tx) => {
    await slidesService.removeAllByPresentation(tx, userId, presentationId);
    await tx.delete(presentations).where(eq(presentations.id, presentationId));
  });
};

const updateTitle = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  title: string,
) => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { userId: true },
  });
  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  const isOwner = presentationRow.userId === userId;
  if (!isOwner) {
    throw new Error("user unauthorized to edit this title");
  }
  await db
    .update(presentations)
    .set({ title: title })
    .where(eq(presentations.id, presentationId));
};

export const presentationsService = {
  findMany,
  findOneDetailed,
  updateTitle,
  create,
  remove,
} as const;
