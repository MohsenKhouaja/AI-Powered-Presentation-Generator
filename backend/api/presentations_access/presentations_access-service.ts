import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import type { DBContext } from "../../database/index.js";
import { editAccess } from "../../database/drizzle/schema.js";
import { eq } from "drizzle-orm";
import type { EditAccessRow, NewEditAccessRow } from "../../database/types.js";

interface PresentationAccessEntry {
  id: UUID;
  email: string;
  userId: UUID;
  presentationId: UUID;
  expiresAt: Date | null;
  username: string;
}

type EditAccessWithUserRow = EditAccessRow & {
  user: { username: string; email: string } | null;
};

const grantAccess = async (
  db: DBContext,
  userId: UUID,
  editAccessInsert: NewEditAccessRow,
): Promise<EditAccessRow> => {
  const userRow = await db.query.users.findFirst({
    where: { email: editAccessInsert.email },
    columns: { id: true },
  });
  if (!userRow) {
    throw new Error("user doesn't exist");
  }
  const userIdFromEmail = userRow.id;

  //user atha 3andou 7a9 ya3ti access ? presentation m3teou?
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: editAccessInsert.presentationId },
    columns: { userId: true },
  });
  if (!presentationRow) {
    throw new Error("presnetation doesn't exist");
  }
  const userOwnsPresentation: boolean = presentationRow.userId === userId;
  if (!userOwnsPresentation) {
    throw new Error("user unauthorized to grand access");
  }
  const existingAccessRow = await db.query.editAccess.findFirst({
    where: {
      userId: userIdFromEmail,
      presentationId: editAccessInsert.presentationId,
    },
    columns: { id: true },
  });

  const expiresAtValue = editAccessInsert.expiresAt || null;

  let editAccessId = randomUUID();
  if (existingAccessRow) {
    editAccessId = existingAccessRow.id as UUID;
    await db
      .update(editAccess)
      .set({ expiresAt: expiresAtValue })
      .where(eq(editAccess.id, editAccessId));
  } else {
    await db.insert(editAccess).values({
      id: editAccessId,
      userId: userIdFromEmail,
      presentationId: editAccessInsert.presentationId,
      expiresAt: expiresAtValue,
    });
  }

  return {
    id: editAccessId,
    userId: userIdFromEmail,
    presentationId: editAccessInsert.presentationId,
    expiresAt: editAccessInsert.expiresAt,
  };
};

/* const getPresentationAccess = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
): Promise<PresentationAccessEntry[]> => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { userId: true },
  });

  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  const isOwner = presentationRow.userId === requesterId;
  if (!isOwner) {
    const activeEditAccess = await db.query.editAccess.findFirst({
      where: {
        presentationId,
        userId: requesterId,
        OR: [
          { expiresAt: { isNull: true } },
          { expiresAt: { gt: new Date() } },
        ],
      },
      columns: { id: true },
    });

    if (!activeEditAccess) {
      throw new Error("user unauthorized to access this presentation");
    }
  }

  const rows: EditAccessWithUserRow[] = await db.query.editAccess.findMany({
    where: {
      presentationId,
      OR: [{ expiresAt: { isNull: true } }, { expiresAt: { gt: new Date() } }],
    },
    with: {
      user: {
        columns: { username: true, email: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id as UUID,
    username: row.user?.username ?? "",
    email: row.user?.email ?? "",
    userId: row.userId as UUID,
    presentationId: row.presentationId as UUID,
    expiresAt: row.expiresAt,
  }));
};

const removeAccess = async (
  db: DBContext,
  requesterId: UUID,
  accessId: UUID,
): Promise<{ success: boolean }> => {
  const row = await db.query.editAccess.findFirst({
    where: { id: accessId },
    with: {
      presentation: {
        columns: { userId: true },
      },
    },
  });

  if (!row) {
    throw new Error("access entry doesn't exist");
  }

  if (row.presentation?.userId !== requesterId) {
    throw new Error("user unauthorized to remove access");
  }

  await db.delete(editAccess).where(eq(editAccess.id, accessId));

  return { success: true };
};

const createShareLink = async (
  db: DBContext,
  requesterId: UUID,
  presentationId: UUID,
): Promise<{ shareUrl: string }> => {
  const presentationRow = await db.query.presentations.findFirst({
    where: { id: presentationId },
    columns: { userId: true },
  });

  if (!presentationRow) {
    throw new Error("presentation doesn't exist");
  }

  const userOwnsPresentation = presentationRow.userId === requesterId;
  if (!userOwnsPresentation) {
    throw new Error("user unauthorized to generate share link");
  }

  const fallbackOrigin = process.env.ALLOWED_ORIGINS?.split(",").find(Boolean);
  const frontendOrigin =
    process.env.FRONTEND_URL?.trim() ||
    process.env.APP_BASE_URL?.trim() ||
    fallbackOrigin?.trim() ||
    "http://localhost:3000";
  const normalizedOrigin = frontendOrigin.replace(/\/$/, "");

  return {
    shareUrl: `${normalizedOrigin}/shared/${presentationId}`,
  };
}; */

export const accessService = {
  grantAccess: grantAccess,
  // getPresentationAccess: getPresentationAccess,
  // removeAccess: removeAccess,
  // createShareLink: createShareLink,
} as const;
