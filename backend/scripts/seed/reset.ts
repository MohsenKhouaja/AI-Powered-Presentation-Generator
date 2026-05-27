import type { UUID } from "node:crypto";

import { and, inArray, like } from "drizzle-orm";
import type { Collection, DeleteResult } from "mongodb";

import { db, mongoDB } from "../../database/index.js";
import { presentations, slides, users } from "../../database/drizzle/schema.js";

import { SEED_PRESENTATION_TITLE_PREFIX, SEED_USERS } from "./dataset.js";

type SlideContentDocument = {
  _id: string;
  slide_content: string;
};

const slidesContentCollection: Collection<SlideContentDocument> =
  mongoDB.collection<SlideContentDocument>("slides_content");

export type ResetResult = {
  seedEmails: string[];
  seedUserIds: UUID[];
  seedPresentationIds: UUID[];
  seedSlideIds: UUID[];
  deletedMongoDocs: number;
  deletedPresentationsAttempted: number;
  deletedUsersAttempted: number;
};

export const runReset = async (): Promise<ResetResult> => {
  // Touch `mongoDB` so the import is intentional (and ensures it’s initialized).
  void mongoDB.databaseName;

  const seedEmails = SEED_USERS.map((u) => u.email);

  const seedUsers =
    seedEmails.length > 0
      ? await db.query.users.findMany({
          where: {
            email: {
              in: seedEmails,
            },
          },
          columns: { id: true, email: true },
        })
      : [];

  const seedUserIds = seedUsers.map((u) => u.id as UUID);

  const seedPresentations =
    seedUserIds.length > 0
      ? await db
          .select({
            id: presentations.id,
            userId: presentations.userId,
          })
          .from(presentations)
          .where(
            and(
              inArray(presentations.userId, seedUserIds),
              like(presentations.title, `${SEED_PRESENTATION_TITLE_PREFIX}%`),
            ),
          )
      : [];

  const seedPresentationIds = seedPresentations.map((p) => p.id as UUID);

  const seedSlides =
    seedPresentationIds.length > 0
      ? await db
          .select({ id: slides.id })
          .from(slides)
          .where(inArray(slides.presentationId, seedPresentationIds))
      : [];

  const seedSlideIds = seedSlides.map((s) => s.id as UUID);

  const mongoDeleteResult: DeleteResult =
    seedSlideIds.length > 0
      ? await slidesContentCollection.deleteMany({
          _id: { $in: seedSlideIds },
        })
      : ({ deletedCount: 0 } as unknown as DeleteResult);

  if (seedPresentationIds.length > 0) {
    await db
      .delete(presentations)
      .where(inArray(presentations.id, seedPresentationIds));
  }

  if (seedEmails.length > 0) {
    await db.delete(users).where(inArray(users.email, seedEmails));
  }

  return {
    seedEmails,
    seedUserIds,
    seedPresentationIds,
    seedSlideIds,
    deletedMongoDocs: mongoDeleteResult.deletedCount ?? 0,
    deletedPresentationsAttempted: seedPresentationIds.length,
    deletedUsersAttempted: seedEmails.length,
  };
};
