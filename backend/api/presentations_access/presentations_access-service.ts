import { randomBytes, randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { eq } from "drizzle-orm";
import {
  hashShareToken,
  requirePresentationAccess,
  requireShareLinkAccess,
} from "../../authorization/presentation-authorization.js";
import type { DBContext } from "../../database/index.js";
import {
  presentationAccessGrants,
  presentationShareLinks,
} from "../../database/drizzle/schema.js";
import { conflict, notFound } from "../../errors/http-error.js";
import { config } from "../../config/env.js";

export type GrantPermission = "viewer" | "editor";

type GrantInput = {
  email: string;
  permission: GrantPermission;
  expiresAt: Date | null;
};

const serializeGrant = (row: {
  id: string;
  permission: GrantPermission;
  expiresAt: Date | null;
  user: { id: string; username: string; email: string } | null;
}) => ({
  id: row.id,
  permission: row.permission,
  expiresAt: row.expiresAt,
  user: row.user,
});

const listGrants = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
) => {
  await requirePresentationAccess(db, {
    userId: requesterId,
    presentationId,
    action: "manageAccess",
  });

  const rows = await db.query.presentationAccessGrants.findMany({
    where: {
      presentationId,
      OR: [{ expiresAt: { isNull: true } }, { expiresAt: { gt: new Date() } }],
    },
    with: {
      user: {
        columns: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(serializeGrant);
};

const grantAccess = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
  input: GrantInput,
) => {
  const authorization = await requirePresentationAccess(db, {
    userId: requesterId,
    presentationId,
    action: "manageAccess",
  });

  const targetUser = await db.query.users.findFirst({
    where: { email: input.email.trim().toLowerCase() },
    columns: { id: true, username: true, email: true },
  });
  if (!targetUser) {
    throw notFound("A registered user with that email was not found", "USER_NOT_FOUND");
  }
  if (targetUser.id === authorization.presentation.userId) {
    throw conflict("The presentation owner already has full access", "OWNER_GRANT");
  }

  const existing = await db.query.presentationAccessGrants.findFirst({
    where: { userId: targetUser.id, presentationId },
    columns: { id: true },
  });

  const grantId = existing?.id ?? randomUUID();
  if (existing) {
    await db
      .update(presentationAccessGrants)
      .set({
        permission: input.permission,
        expiresAt: input.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(presentationAccessGrants.id, grantId));
  } else {
    await db.insert(presentationAccessGrants).values({
      id: grantId,
      userId: targetUser.id,
      presentationId,
      permission: input.permission,
      expiresAt: input.expiresAt,
    });
  }

  return {
    id: grantId,
    permission: input.permission,
    expiresAt: input.expiresAt,
    user: targetUser,
  };
};

const removeGrant = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
  grantId: UUID,
): Promise<void> => {
  await requirePresentationAccess(db, {
    userId: requesterId,
    presentationId,
    action: "manageAccess",
  });

  const grant = await db.query.presentationAccessGrants.findFirst({
    where: { id: grantId, presentationId },
    columns: { id: true },
  });
  if (!grant) {
    throw notFound("Access grant not found", "GRANT_NOT_FOUND");
  }

  await db
    .delete(presentationAccessGrants)
    .where(eq(presentationAccessGrants.id, grantId));
};

const getShareLinkStatus = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
) => {
  await requirePresentationAccess(db, {
    userId: requesterId,
    presentationId,
    action: "manageAccess",
  });

  const link = await db.query.presentationShareLinks.findFirst({
    where: { presentationId },
    columns: {
      expiresAt: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const now = new Date();

  return {
    active: Boolean(
      link &&
        link.revokedAt === null &&
        (link.expiresAt === null || link.expiresAt.getTime() > now.getTime()),
    ),
    expiresAt: link?.expiresAt ?? null,
    createdAt: link?.createdAt ?? null,
    updatedAt: link?.updatedAt ?? null,
  };
};

const createOrRotateShareLink = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
  expiresAt: Date | null,
) => {
  await requirePresentationAccess(db, {
    userId: requesterId,
    presentationId,
    action: "manageAccess",
  });

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashShareToken(token);
  const existing = await db.query.presentationShareLinks.findFirst({
    where: { presentationId },
    columns: { id: true },
  });

  if (existing) {
    await db
      .update(presentationShareLinks)
      .set({ tokenHash, expiresAt, revokedAt: null, updatedAt: new Date() })
      .where(eq(presentationShareLinks.id, existing.id));
  } else {
    await db.insert(presentationShareLinks).values({
      id: randomUUID(),
      presentationId,
      tokenHash,
      expiresAt,
    });
  }

  const allowedOrigins = config.allowedOrigins;
  const fallbackOrigin =
    allowedOrigins.find((origin) => {
      try {
        return new URL(origin).port === "3000";
      } catch {
        return false;
      }
    }) ?? allowedOrigins[0];
  const frontendOrigin =
    process.env.FRONTEND_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    fallbackOrigin?.trim() ||
    "http://localhost:3000";

  return {
    shareUrl: `${frontendOrigin.replace(/\/$/, "")}/share#token=${token}`,
    expiresAt,
  };
};

const revokeShareLink = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
): Promise<void> => {
  await requirePresentationAccess(db, {
    userId: requesterId,
    presentationId,
    action: "manageAccess",
  });

  await db
    .update(presentationShareLinks)
    .set({ revokedAt: new Date(), updatedAt: new Date() })
    .where(eq(presentationShareLinks.presentationId, presentationId));
};

const getPublicPresentation = async (db: DBContext, token: string) => {
  const authorization = await requireShareLinkAccess(db, { token });
  const slideRows = await db.query.slides.findMany({
    where: { presentationId: authorization.presentation.id },
    columns: { id: true, content: true, slideOrder: true },
    orderBy: { slideOrder: "asc" },
  });

  return {
    title: authorization.presentation.title,
    slides: slideRows,
  };
};

export const accessService = {
  listGrants,
  grantAccess,
  removeGrant,
  getShareLinkStatus,
  createOrRotateShareLink,
  revokeShareLink,
  getPublicPresentation,
} as const;
