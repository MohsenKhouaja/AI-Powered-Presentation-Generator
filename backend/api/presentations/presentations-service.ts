import { randomUUID, UUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import type { PoolConnection, Pool } from "mysql2/promise";
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
  db: PoolConnection | Pool,
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

const findOneDetailed = async (
  db: PoolConnection | Pool,
  presentationId: UUID,
) => {
  const [rows] = await db.query({
    sql: `select p.id , p.title , p.user_id, p.created_at,  c.id, c.prompt
  from  presentations p 
  join contexts c on  c.presentation_id = p.id
  join files f on  f.context_id= c.id `,
    nestTables: true,
  });

  //get slides
};

const create = async (
  db: PoolConnection | Pool,
  presentation: presentationInsert,
) => {
  const query = SQL`insert into presentations (id,title,user_id) values (${randomUUID()},${presentation.title},${presentation.userId})`;
  await db.query(query);
};

const remove = async (
  db: PoolConnection | Pool,
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

export const presentationsService = {
  findMany: findMany,
  findOneDetailed: findOneDetailed,
  create: create,
  remove: remove,
} as const;
