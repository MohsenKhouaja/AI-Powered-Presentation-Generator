import { randomUUID, UUID } from "node:crypto";
import { pool } from "../../database/index.js";
import { SQL } from "sql-template-strings";
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

const findMany = async (userId: UUID): Promise<Presentation[]> => {
  const [ownedPresentationRows] = await pool.query(
    SQL`select * from presentations where user_id= ${userId}`,
  );
  const ownedPresentations: Presentation[] = ownedPresentationRows.map((row) =>
    serializePresentation(row, "own"),
  );
  const [editPresentationIds] = await pool.query(
    SQL`select presentation_id from edit_access where user_id=${userId}`,
  );
  const editPresentationIdsArray: string[] = editPresentationIds.map(
    (elm) => elm.presentation_id,
  );
  const query = SQL`select * from presentations where id IN (`;
  editPresentationIdsArray.forEach((id, i) => {
    query.append(SQL`${id}`);
    if (i < editPresentationIdsArray.length - 1) query.append(SQL`, `);
  });
  query.append(SQL`)`);
  const [editPresentationRows] =
    editPresentationIdsArray.length > 0 ? await pool.query(query) : [];
  const editPresentations: Presentation[] = editPresentationRows.map((row) =>
    serializePresentation(row, "edit"),
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

const findOneDetailed = async (presentationId: UUID) => {
  const [rows] = await pool.query({
    sql: `select p.id , p.title , p.user_id, p.created_at,  c.id, c.prompt
  from  presentations p 
  join contexts c on  c.presentation_id = p.id
  join files f on  f.context_id= c.id `,
    nestTables: true,
  });

  //get slides
};

const create = async (presentation: presentationInsert) => {
  const query = SQL`insert into presentations (id,title,user_id) values (${randomUUID()},${presentation.title},${presentation.userId})`;
  await pool.query(query);
};
const remove = async (userId: UUID, presentationId: UUID) => {
  const presentationQuery = SQL`select * from presentations where id = ${presentationId}`;
  const [rows]: [Presentation[], any] = await pool.query(presentationQuery);
  if (rows.length === 0) {
    throw new Error("presentation doesn't exist");
  }
  const presentation = serializePresentation(rows[0]);
  if (presentation.userId !== userId) {
    throw new Error("user not authorized to delete this presentation");
  }
  await pool.query(SQL`delete from presentations where id=${presentationId}`);
};
const grantAccess = async (
  userId: UUID,
  editAccessInsert: editAccessInsert,
) => {
  // ntale3 el user id mel mail
  const [userIds] = await pool.query<{ id: string }[]>(
    SQL`select id from users where email=${editAccessInsert.email}`,
  );
  if (userIds.length === 0) {
    throw new Error("user doesn't exist");
  }
  const userIdFromEmail = userIds[0].id;

  //user atha 3andou 7a9 ya3ti access ? presentation m3teou?
  const [presentations] = await pool.query<Array>(
    SQL`select * from presentations where id=${editAccessInsert.presentationId} `,
  );
  if (presentations.length === 0) {
    throw new Error("presnetation doesn't exist");
  }
  // serialize presentation row first (serializePresentation) before ownership checks to avoid direct snake_case coupling
  const userOwnsPresentation: boolean =
    serializePresentation(presentations[0]).userId === userId;
  if (!userOwnsPresentation) {
    throw new Error("user unauthorized to grand access");
  }
  const query = SQL`insert into edit_access (id,user_id,presentation_id,expires_at) values (${randomUUID()},${userIdFromEmail},${editAccessInsert.presentationId},${editAccessInsert.expiresAt || null})`;
  await pool.query(query);
};

export const presentationsService = {
  findMany: findMany,
  findOneDetailed: findOneDetailed,
  create: create,
  remove: remove,
  grantAccess: grantAccess,
} as const;
