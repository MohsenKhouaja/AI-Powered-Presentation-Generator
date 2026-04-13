import type { PoolConnection, Pool } from "mysql2/promise";
import { randomUUID, UUID } from "node:crypto";
import {
  editAccessInsert,
  serializePresentation,
  serializeUser,
  type User,
} from "../../database/types.js";
import { SQL } from "sql-template-strings";

const grantAccess = async (
  db: PoolConnection | Pool,
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

const getPresentationAccess = async (
  db: PoolConnection | Pool,
  presentationId: UUID,
): Promise<User[]> => {
  const query = SQL`select u.id, u.username, u.email
  from edit_access ea
  join users u on ea.user_id = u.id
  where ea.presentation_id=${presentationId}
    and (ea.expires_at is null or ea.expires_at > now())`;
  const [rows] = await db.query(query);
  return (rows as any[]).map((row) => serializeUser(row));
};

export const accessService = {
  grantAccess: grantAccess,
  getPresentationAccess: getPresentationAccess,
} as const;
