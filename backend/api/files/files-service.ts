import { UUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import { File, fileInsert } from "../../database/types.js";
import type { PoolConnection, Pool } from "mysql2/promise";

const createOne = async (
  db: PoolConnection | Pool,
  file: fileInsert,
): Promise<File> => {
  const query = SQL`insert into files (id, context_id, storage_key, mime_type, file_type, size_bytes, original_name) values (${file.id}, ${file.contextId}, ${file.storageKey}, ${file.mimeType}, ${file.fileType}, ${file.sizeBytes}, ${file.originalname})`;
  await db.query(query);
  return {
    id: file.id,
    contextId: file.contextId,
    originalname: file.originalname,
    storageKey: file.storageKey,
    mimeType: file.mimeType,
    fileType: file.fileType,
    sizeBytes: file.sizeBytes,
  };
};

const createMany = async (
  db: PoolConnection | Pool,
  files: fileInsert[],
): Promise<File[]> => {
  if (files.length === 0) return [];

  const filesWithIds = files.map((file) => ({ ...file }));

  const query = SQL`insert into files (id, context_id, storage_key, mime_type, file_type, size_bytes, original_name) values `;

  filesWithIds.forEach((file, index) => {
    query.append(
      SQL`(${file.id}, ${file.contextId}, ${file.storageKey}, ${file.mimeType}, ${file.fileType}, ${file.sizeBytes}, ${file.originalname})`,
    );
    if (index < filesWithIds.length - 1) query.append(SQL`, `);
  });
  await db.query(query);

  return filesWithIds;
};

const deleteMany = async (db: PoolConnection | Pool, fileIds: UUID[]) => {
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
