import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";

import { hash } from "node:bcrypt";
import type { Collection } from "mongodb";

import { db, mongoDB } from "../../database/index.js";
import {
  contexts,
  presentations,
  slides,
  users,
} from "../../database/drizzle/schema.js";

import { SEED_PRESENTATIONS, SEED_USERS } from "./dataset.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type SlideContentDocument = {
  _id: string;
  slide_content: string;
};

type SeededUser = {
  id: UUID;
  email: string;
  /** Plaintext password echoed in the summary so devs can log in easily. */
  password: string;
};

type SeededPresentation = {
  id: UUID;
  /** Short stable key from the dataset, used in log output. */
  key: string;
};

export type SeedResult = {
  seededUsers: SeededUser[];
  seededPresentations: SeededPresentation[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BCRYPT_ROUNDS = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slidesContentCollection: Collection<SlideContentDocument> =
  mongoDB.collection<SlideContentDocument>("slides_content");

// ─── Main ─────────────────────────────────────────────────────────────────────

export const runSeed = async (): Promise<SeedResult> => {
  // Touch mongoDB so the import is intentional and the connection is verified.
  void mongoDB.databaseName;

  // ── 1. Insert users ──────────────────────────────────────────────────────

  const seededUsers: SeededUser[] = [];

  for (const seedUser of SEED_USERS) {
    const id = randomUUID() as UUID;
    const hashedPassword = await hash(seedUser.password, BCRYPT_ROUNDS);

    await db.insert(users).values({
      id,
      username: seedUser.username,
      email: seedUser.email,
      password: hashedPassword,
    });

    seededUsers.push({
      id,
      email: seedUser.email,
      password: seedUser.password,
    });
  }

  // ── 2. Insert presentations, contexts, and slides ────────────────────────

  const seededPresentations: SeededPresentation[] = [];

  for (const seedPresentation of SEED_PRESENTATIONS) {
    const owner = seededUsers[seedPresentation.ownerIndex];

    if (!owner) {
      throw new Error(
        `Seed dataset error: ownerIndex ${seedPresentation.ownerIndex} is out of bounds for presentation "${seedPresentation.key}".`,
      );
    }

    // ── 2a. Presentation row ─────────────────────────────────────────────

    const presentationId = randomUUID() as UUID;

    await db.insert(presentations).values({
      id: presentationId,
      title: seedPresentation.title,
      userId: owner.id,
    });

    seededPresentations.push({ id: presentationId, key: seedPresentation.key });

    // ── 2b. Context row (one per presentation, unique constraint) ────────

    const contextId = randomUUID() as UUID;

    await db.insert(contexts).values({
      id: contextId,
      prompt: seedPresentation.contextPrompt,
      presentationId,
    });

    // ── 2c. Slides — MySQL row + MongoDB document ────────────────────────

    const mongoDocuments: SlideContentDocument[] = [];

    for (const seedSlide of seedPresentation.slides) {
      const slideId = randomUUID() as UUID;

      await db.insert(slides).values({
        id: slideId,
        presentationId,
        slideOrder: seedSlide.order,
      });

      // Collect mongo docs to bulk-insert after all MySQL rows succeed.
      mongoDocuments.push({
        _id: slideId,
        slide_content: seedSlide.markdown,
      });
    }

    if (mongoDocuments.length > 0) {
      await slidesContentCollection.insertMany(mongoDocuments);
    }
  }

  return { seededUsers, seededPresentations };
};
