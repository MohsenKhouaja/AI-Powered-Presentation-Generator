import { randomUUID, UUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import type { PoolConnection } from "mysql2/promise";
import type {
  Presentation,
  presentationInsert,
  editAccessInsert,
  User,
} from "../../database/types.js";
import {
  serializePresentation,
  serializePresentationDetail,
  serializeSlide,
} from "../../database/types.js";

const findMany = async (
  db: PoolConnection,
  userId: UUID,
): Promise<Presentation[]> => {
  const [ownedPresentationRows] = await db.query(
    SQL`select * from presentations where user_id= ${userId}`,
  );
  const ownedPresentations: Presentation[] = (
    ownedPresentationRows as any[]
  ).map((row) => serializePresentation(row, "own"));
  const [editPresentationIds] = await db.query(
    SQL`select presentation_id from edit_access where user_id=${userId}`,
  );
  const editPresentationIdsArray: string[] = (editPresentationIds as any[]).map(
    (elm) => elm.presentation_id,
  );
  const query = SQL`select * from presentations where id IN (`;
  editPresentationIdsArray.forEach((id, i) => {
    query.append(SQL`${id}`);
    if (i < editPresentationIdsArray.length - 1) query.append(SQL`, `);
  });
  query.append(SQL`)`);
  const [editPresentationRows] =
    editPresentationIdsArray.length > 0 ? await db.query(query) : [[]];
  const editPresentations: Presentation[] = (editPresentationRows as any[]).map(
    (row) => serializePresentation(row, "edit"),
  );
  ownedPresentations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  editPresentations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return [...ownedPresentations, ...editPresentations];
};

type PresentationDetail = {
  readonly id: string;
  title: string;
  readonly userId: UUID;
  readonly createdAt: Date;
  slides: {
    id: UUID;
    content: string;
    presentationId: UUID;
    slideOrder: number;
  }[];
  context: {
    id: UUID;
    prompt: string;
  };
  AccessType: "edit" | "own";
};

const findOneDetailed = async (db: PoolConnection, presentationId: UUID) => {
  const [rows] = await db.query({
    sql: `select p.id , p.title , p.user_id, p.created_at,  c.id, c.prompt
  from  presentations p 
  join contexts c on  c.presentation_id = p.id
  join files f on  f.context_id= c.id `,
    nestTables: true,
  });

  //get slides
};

const create = async (db: PoolConnection, presentation: presentationInsert) => {
  const query = SQL`insert into presentations (id,title,user_id) values (${randomUUID()},${presentation.title},${presentation.userId})`;
  await db.query(query);
};
const remove = async (
  db: PoolConnection,
  userId: UUID,
  presentationId: UUID,
) => {
  const presentationQuery = SQL`select * from presentations where id = ${presentationId}`;
  const [rows] = await db.query(presentationQuery);
  const presentationRows = rows as Presentation[];
  if (presentationRows.length === 0) {
    throw new Error("presentation doesn't exist");
  }
  const presentation = serializePresentation(presentationRows[0]);
  if (presentation.userId !== userId) {
    throw new Error("user not authorized to delete this presentation");
  }
  await db.query(SQL`delete from presentations where id=${presentationId}`);
};
const grantAccess = async (
  db: PoolConnection,
  userId: UUID,
  editAccessInsert: editAccessInsert,
) => {
  // ntale3 el user id mel mail
  const [userIds] = await db.query(
    SQL`select id from users where email=${editAccessInsert.email}`,
  );
  if ((userIds as any[]).length === 0) {
    throw new Error("user doesn't exist");
  }
  const userIdFromEmail = (userIds as any[])[0].id;

  //user atha 3andou 7a9 ya3ti access ? presentation m3teou?
  const [presentations] = await db.query(
    SQL`select * from presentations where id=${editAccessInsert.presentationId} `,
  );
  if ((presentations as any[]).length === 0) {
    throw new Error("presnetation doesn't exist");
  }
  // serialize presentation row first (serializePresentation) before ownership checks to avoid direct snake_case coupling
  const userOwnsPresentation: boolean =
    serializePresentation((presentations as any[])[0]).userId === userId;
  if (!userOwnsPresentation) {
    throw new Error("user unauthorized to grand access");
  }
  const query = SQL`insert into edit_access (id,user_id,presentation_id,expires_at) values (${randomUUID()},${userIdFromEmail},${editAccessInsert.presentationId},${editAccessInsert.expiresAt || null})`;
  await db.query(query);
};

export const presentationsService = {
  findMany: findMany,
  findOneDetailed: findOneDetailed,
  create: create,
  remove: remove,
  grantAccess: grantAccess,
} as const;
