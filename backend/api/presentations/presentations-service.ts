import { randomUUID } from "node:crypto";
import type { UUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { requirePresentationAccess } from "../../authorization/presentation-authorization.js";
import { evaluatePresentationPolicy } from "../../authorization/policy.js";
import type { DBContext } from "../../database/index.js";
import { presentations } from "../../database/drizzle/schema.js";
import type {
  NewPresentationRow,
  PresentationDetail,
  PresentationRow,
  PresentationSummary,
} from "../../database/types.js";
import { contextService } from "../contexts/contexts-service.js";

const findMany = async (
  db: DBContext,
  userId: UUID,
): Promise<PresentationSummary[]> => {
  const now = new Date();
  const ownedRows = await db.query.presentations.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const grantRows = await db.query.presentationAccessGrants.findMany({
    where: {
      userId,
      OR: [{ expiresAt: { isNull: true } }, { expiresAt: { gt: now } }],
    },
    with: { presentation: true },
  });

  return [
    ...ownedRows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.createdAt,
      accessLevel: "owner" as const,
      capabilities: evaluatePresentationPolicy({
        subject: { userId },
        resource: { ownerId: row.userId },
        relationship: {},
        environment: { now },
      }).capabilities,
    })),
    ...grantRows
      .filter((row) => row.presentation !== null)
      .map((row) => ({
        id: row.presentation!.id,
        title: row.presentation!.title,
        createdAt: row.presentation!.createdAt,
        accessLevel: row.permission,
        capabilities: evaluatePresentationPolicy({
          subject: { userId },
          resource: { ownerId: row.presentation!.userId },
          relationship: {
            grant: {
              permission: row.permission,
              expiresAt: row.expiresAt,
            },
          },
          environment: { now },
        }).capabilities,
      })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const findOneDetailed = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
): Promise<PresentationDetail> => {
  const authorization = await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "view",
  });
  const slideRows = await db.query.slides.findMany({
    where: { presentationId },
    orderBy: { slideOrder: "asc" },
  });

  let context = null;
  if (authorization.capabilities.viewSources) {
    const contextRow = await db.query.contexts.findFirst({
      where: { presentationId },
      columns: { id: true },
    });
    if (contextRow) {
      context = await contextService.findOne(
        db,
        userId,
        contextRow.id as UUID,
      );
    }
  }

  return {
    id: authorization.presentation.id,
    title: authorization.presentation.title,
    createdAt: authorization.presentation.createdAt,
    slides: slideRows,
    context,
    accessLevel: authorization.accessLevel,
    capabilities: authorization.capabilities,
  };
};

const create = async (
  db: DBContext,
  presentation: NewPresentationRow,
): Promise<PresentationRow> => {
  const presentationId = randomUUID();
  const createdAt = new Date();
  await db.transaction(async (tx) => {
    await tx.insert(presentations).values({
      id: presentationId,
      title: presentation.title,
      userId: presentation.userId,
      createdAt,
    });
    await contextService.createForPresentation(
      tx,
      { prompt: "", presentationId },
      [],
    );
  });
  return {
    id: presentationId,
    title: presentation.title,
    userId: presentation.userId as UUID,
    createdAt,
  };
};

const remove = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
): Promise<void> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "delete",
  });
  await db.delete(presentations).where(eq(presentations.id, presentationId));
};

const updateTitle = async (
  db: DBContext,
  userId: UUID,
  presentationId: UUID,
  title: string,
): Promise<void> => {
  await requirePresentationAccess(db, {
    userId,
    presentationId,
    action: "editContent",
  });
  await db
    .update(presentations)
    .set({ title })
    .where(eq(presentations.id, presentationId));
};

export const presentationsService = {
  findMany,
  findOneDetailed,
  updateTitle,
  create,
  remove,
} as const;
