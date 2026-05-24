import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import type { Collection } from "mongodb";
import type { DBContext } from "../../database/index.js";
import { mongoDB } from "../../database/index.js";
import {
  editAccess,
  presentations,
  slides,
} from "../../database/drizzle/schema.js";
import type { SlideRow } from "../../database/types.js";

export type slideOrder = {
  id: UUID;
  order: number;
}[];

type SlideContentDocument = {
  _id: string;
  slide_content: string;
};

type SlideCreateInput = {
  content: string;
  slideOrder?: number;
};

const slidesContentCollection: Collection<SlideContentDocument> =
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

const assertCanEditPresentation = async (
  db: DBContext,
  presentationId: UUID,
  userId: UUID,
): Promise<void> => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { id: true, userId: true },
  });

  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  if (presentationRow.userId === userId) {
    return;
  }

  const canEdit = await hasActiveEditAccess(db, presentationId, userId);
  if (!canEdit) {
    throw new Error("user unauthorized to edit this presentation");
  }
};

const getMongoContentBySlideId = async (
  slideId: UUID,
): Promise<string | null> => {
  const contentDoc = await slidesContentCollection.findOne({ _id: slideId });
  return contentDoc?.slide_content ?? null;
};

const findMany = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
): Promise<SlideRow[]> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRows: SlideRow[] = await db.query.slides.findMany({
    where: { presentationId },
    orderBy: { slideOrder: "asc" },
  });

  return await Promise.all(
    slideRows.map(async (slideRow) => {
      const mongoContent = await getMongoContentBySlideId(slideRow.id as UUID);
      return {
        id: slideRow.id,
        presentationId: slideRow.presentationId,
        content: mongoContent ?? slideRow.content,
        slideOrder: slideRow.slideOrder,
      };
    }),
  );
};

const findOne = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
): Promise<SlideRow> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRow: SlideRow | null = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw new Error("slide doesn't exist");
  }

  const mongoContent = await getMongoContentBySlideId(slideId);
  return {
    id: slideRow.id,
    presentationId: slideRow.presentationId,
    content: mongoContent ?? slideRow.content,
    slideOrder: slideRow.slideOrder,
  };
};

const create = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  input: SlideCreateInput,
): Promise<SlideRow> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideId = randomUUID();

  const maxOrderRow = await db.query.slides.findFirst({
    where: { presentationId },
    columns: { slideOrder: true },
    orderBy: { slideOrder: "desc" },
  });

  const maxOrder = maxOrderRow?.slideOrder ?? 0;

  const nextOrder =
    typeof input.slideOrder === "number" && input.slideOrder > 0
      ? input.slideOrder
      : maxOrder + 1;

  await db.insert(slides).values({
    id: slideId,
    presentationId,
    slideOrder: nextOrder,
  });

  await slidesContentCollection.insertOne({
    _id: slideId,
    slide_content: input.content,
  });

  return {
    id: slideId,
    presentationId,
    content: input.content,
    slideOrder: nextOrder,
  };
};

const update = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
  content: string,
): Promise<SlideRow> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRow: SlideRow | null = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
  });

  if (!slideRow) {
    throw new Error("slide doesn't exist");
  }

  await slidesContentCollection.updateOne(
    { _id: slideId },
    { $set: { slide_content: content } },
    { upsert: true },
  );

  return {
    id: slideRow.id,
    presentationId: slideRow.presentationId,
    content: content,
    slideOrder: slideRow.slideOrder,
  };
};

//mohsen nbadel el ordre
const removeOne = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  slideId: UUID,
): Promise<{ id: UUID; deleted: true }> => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRow = await db.query.slides.findFirst({
    where: { id: slideId, presentationId },
    columns: { id: true },
  });

  if (!slideRow) {
    throw new Error("slide doesn't exist");
  }

  await db.delete(slides).where(eq(slides.id, slideId));
  await slidesContentCollection.deleteOne({ _id: slideId });

  return { id: slideId, deleted: true };
};

const updateOrder = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  firstSlideOrder: slideOrder,
  secondSlideOrder: slideOrder,
): Promise<slideOrder[]> => {
  await assertCanEditPresentation(db, presentationId, userId);
  if (firstSlideOrder.length !== secondSlideOrder.length) {
    throw new Error("slide orders length mismatch");
  }
  await db.transaction(async (tx) => {
    for (let i = 0; i < firstSlideOrder.length; i++) {
      const firstSlide = firstSlideOrder[i];
      const secondSlide = secondSlideOrder[i];
      if (firstSlide.id !== secondSlide.id) {
        await tx.slides
          .update()
          .set({ slideOrder: secondSlide.order })
          .where(eq(slides.id, firstSlide.id));
      }
    }
  });
  return [secondSlideOrder];
};

const removeAllByPresentation = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
) => {
  await assertCanEditPresentation(db, presentationId, userId);

  const slideRows = await db.query.slides.findMany({
    where: { presentationId },
    columns: { id: true },
  });

  if (!slideRows) {
    throw new Error("slide doesn't exist");
  }

  if (slideRows.length > 0) {
    await slidesContentCollection.deleteMany({
      _id: { $in: slideRows.map((slide) => slide.id) },
    });
  }
};

export const slidesService = {
  findMany,
  findOne,
  create,
  update,
  removeOne,
  removeAllByPresentation,
  updateOrder,
} as const;
