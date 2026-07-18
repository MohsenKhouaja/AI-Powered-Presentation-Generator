import type { UUID } from "node:crypto";

import { and, inArray, like } from "drizzle-orm";

import { db } from "../../database/index.js";
import { presentations, users } from "../../database/drizzle/schema.js";

import { SEED_PRESENTATION_TITLE_PREFIX, SEED_USERS } from "./dataset.js";

export type ResetResult = {
  seedEmails: string[];
  seedUserIds: UUID[];
  seedPresentationIds: UUID[];
  deletedPresentationsAttempted: number;
  deletedUsersAttempted: number;
};

export const runReset = async (): Promise<ResetResult> => {
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
    deletedPresentationsAttempted: seedPresentationIds.length,
    deletedUsersAttempted: seedEmails.length,
  };
};
