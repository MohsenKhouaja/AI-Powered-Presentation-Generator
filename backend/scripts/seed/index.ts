import * as crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { Collection } from "mongodb";

import { db, mongoDB } from "../../database/index.js";
import {
  contexts,
  editAccess,
  files as filesTable,
  presentations,
  slides,
  users,
} from "../../database/drizzle/schema.js";
import { UPLOAD_PATH } from "../../config/uploads.js";

import { SEED_EDIT_ACCESS, SEED_PRESENTATIONS, SEED_USERS } from "./dataset.js";

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

const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

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
    const hashedPassword = await hashPassword(seedUser.password);

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

    // ── 2c. Files — write to disk + MySQL row ────────────────────────────

    if (seedPresentation.files && seedPresentation.files.length > 0) {
      const fileRows = seedPresentation.files.map((seedFile) => {
        const fileName = `${randomUUID()}-${seedFile.originalName}`;
        return {
          id: randomUUID() as UUID,
          contextId,
          fileName,
          mimeType: seedFile.mimeType,
          sizeBytes: Buffer.from(seedFile.base64Content, "base64").length,
          originalName: seedFile.originalName,
        };
      });

      await Promise.all(
        fileRows.map((row, i) =>
          writeFile(
            path.join(UPLOAD_PATH, row.fileName),
            Buffer.from(seedPresentation.files![i].base64Content, "base64"),
          ),
        ),
      );

      await db.insert(filesTable).values(fileRows);
    }

    // ── 2d. Slides — MySQL row + MongoDB document ────────────────────────

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

  // ── 3. Insert edit access (shared presentations) ─────────────────────────

  for (const seedAccess of SEED_EDIT_ACCESS) {
    const presEntry = seededPresentations.find(
      (p) => p.key === seedAccess.presentationKey,
    );

    if (!presEntry) {
      throw new Error(
        `Seed dataset error: presentation key "${seedAccess.presentationKey}" not found for editAccess.`,
      );
    }

    const targetUser = seededUsers.find(
      (u) => u.email === seedAccess.email,
    );

    if (!targetUser) {
      throw new Error(
        `Seed dataset error: user email "${seedAccess.email}" not found for editAccess.`,
      );
    }

    await db.insert(editAccess).values({
      id: randomUUID() as UUID,
      userId: targetUser.id,
      presentationId: presEntry.id,
    });
  }

  return { seededUsers, seededPresentations };
};
