import * as crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { promisify } from "node:util";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { db } from "../../database/index.js";
import {
  contexts,
  files as filesTable,
  presentationAccessGrants,
  presentationShareLinks,
  presentations,
  slides,
  users,
} from "../../database/drizzle/schema.js";
import { UPLOAD_PATH } from "../../config/uploads.js";
import { hashShareToken } from "../../authorization/presentation-authorization.js";

import {
  SEED_ACCESS_GRANTS,
  SEED_PRESENTATIONS,
  SEED_SHARE_LINKS,
  SEED_USERS,
} from "./dataset.js";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  ownerEmail: string;
};

type SeededAccessGrant = {
  id: UUID;
  presentationKey: string;
  email: string;
  permission: "viewer" | "editor";
  expiresAt: Date | null;
};

type SeededShareLink = {
  key: string;
  presentationKey: string;
  token: string;
  expiresAt: Date | null;
  revokedAt: Date | null;
};

export type SeedResult = {
  seededUsers: SeededUser[];
  seededPresentations: SeededPresentation[];
  seededAccessGrants: SeededAccessGrant[];
  seededShareLinks: SeededShareLink[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const scrypt = promisify(crypto.scrypt);

const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const runSeed = async (): Promise<SeedResult> => {
  const seededAt = new Date();

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

    seededPresentations.push({
      id: presentationId,
      key: seedPresentation.key,
      ownerEmail: owner.email,
    });

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

    // ── 2d. Slides ───────────────────────────────────────────────────────

    for (const seedSlide of seedPresentation.slides) {
      const slideId = randomUUID() as UUID;

      await db.insert(slides).values({
        id: slideId,
        presentationId,
        content: seedSlide.markdown,
        slideOrder: seedSlide.order,
      });
    }
  }

  // ── 3. Insert access grants (shared presentations) ───────────────────────

  const seededAccessGrants: SeededAccessGrant[] = [];

  for (const seedAccess of SEED_ACCESS_GRANTS) {
    const presEntry = seededPresentations.find(
      (p) => p.key === seedAccess.presentationKey,
    );

    if (!presEntry) {
      throw new Error(
        `Seed dataset error: presentation key "${seedAccess.presentationKey}" not found for an access grant.`,
      );
    }

    const targetUser = seededUsers.find(
      (u) => u.email === seedAccess.email,
    );

    if (!targetUser) {
      throw new Error(
        `Seed dataset error: user email "${seedAccess.email}" not found for an access grant.`,
      );
    }

    const grantId = randomUUID() as UUID;
    const expiresAt =
      seedAccess.expiresInMinutes === undefined
        ? null
        : new Date(
            seededAt.getTime() + seedAccess.expiresInMinutes * 60 * 1000,
          );

    await db.insert(presentationAccessGrants).values({
      id: grantId,
      userId: targetUser.id,
      presentationId: presEntry.id,
      permission: seedAccess.permission,
      expiresAt,
    });

    seededAccessGrants.push({
      id: grantId,
      presentationKey: seedAccess.presentationKey,
      email: seedAccess.email,
      permission: seedAccess.permission,
      expiresAt,
    });
  }

  // ── 4. Insert share links ─────────────────────────────────────────────────────────

  const seededShareLinks: SeededShareLink[] = [];

  for (const seedShareLink of SEED_SHARE_LINKS) {
    const presEntry = seededPresentations.find(
      (p) => p.key === seedShareLink.presentationKey,
    );

    if (!presEntry) {
      throw new Error(
        `Seed dataset error: presentation key "${seedShareLink.presentationKey}" not found for share link "${seedShareLink.key}".`,
      );
    }

    const expiresAt =
      seedShareLink.expiresInMinutes === undefined
        ? null
        : new Date(
            seededAt.getTime() + seedShareLink.expiresInMinutes * 60 * 1000,
          );
    const revokedAt = seedShareLink.revoked ? seededAt : null;

    await db.insert(presentationShareLinks).values({
      id: randomUUID() as UUID,
      presentationId: presEntry.id,
      tokenHash: hashShareToken(seedShareLink.token),
      expiresAt,
      revokedAt,
    });

    seededShareLinks.push({
      key: seedShareLink.key,
      presentationKey: seedShareLink.presentationKey,
      token: seedShareLink.token,
      expiresAt,
      revokedAt,
    });
  }

  return {
    seededUsers,
    seededPresentations,
    seededAccessGrants,
    seededShareLinks,
  };
};
