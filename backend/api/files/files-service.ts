import { UUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import { fileInsert } from "../../database/types.js";
import type { PoolConnection } from "mysql2/promise";


const createOne = async (db: PoolConnection, file: fileInsert) => {
  const query = SQL`insert into files (id, context_id, storage_key, mime_type, file_type, size_bytes) values (${file.id}, ${file.contextId}, ${file.storageKey}, ${file.mimeType}, ${file.fileType}, ${file.sizeBytes})`;
  await db.query(query);
};

const createMany = async (db: PoolConnection, files: fileInsert[]) => {
  if (files.length === 0) return;

  const query = SQL`insert into files (id, context_id, storage_key, mime_type, file_type, size_bytes) values `;

  files.forEach((file, index) => {
    query.append(
      SQL`(${file.id}, ${file.contextId}, ${file.storageKey}, ${file.mimeType}, ${file.fileType}, ${file.sizeBytes})`,
    );
    if (index < files.length - 1) query.append(SQL`, `);
  });
  await db.query(query);
};

const deleteMany = async (db: PoolConnection, fileIds: UUID[]) => {
  if (fileIds.length === 0) return;
  const query = SQL`delete from files where id IN (`;
  fileIds.forEach((id, index) => {
    query.append(SQL`${id}`);
    if (index < fileIds.length - 1) query.append(SQL`, `);
  });
  query.append(SQL`)`);
  await db.query(query);
};

export const fileService = {
  createOne: createOne,
  createMany: createMany,
  deleteMany: deleteMany,
};
