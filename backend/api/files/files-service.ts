import { randomUUID, UUID } from "node:crypto";
import { pool } from "../../database/index.js";
import { SQL } from "sql-template-strings";
import { fileInsert } from "../../database/types.js";

const createOne = async (file: fileInsert) => {
  const query = SQL`insert into files (id, context_id, storage_key, mime_type, file_type, size_bytes) values (${file.id}, ${file.contextId}, ${file.storageKey}, ${file.mimeType}, ${file.fileType}, ${file.sizeBytes})`;
  await pool.query(query);
};

const createMany = async (files: fileInsert[]) => {
  if (files.length === 0) return;

  const query = SQL`insert into files (id, context_id, storage_key, mime_type, file_type, size_bytes) values `;

  files.forEach((file, index) => {
    query.append(
      SQL`(${file.id}, ${file.contextId}, ${file.storageKey}, ${file.mimeType}, ${file.fileType}, ${file.sizeBytes})`,
    );
    if (index < files.length - 1) query.append(SQL`, `);
  });
  await pool.query(query);
};

const deleteMany = async (fileIds: UUID[]) => {
  if (fileIds.length === 0) return;
  const query = SQL`delete from files where id IN (`;
  fileIds.forEach((id, index) => {
    query.append(SQL`${id}`);
    if (index < fileIds.length - 1) query.append(SQL`, `);
  });
  query.append(SQL`)`);
  await pool.query(query);
};

export const fileService = {
  createOne: createOne,
  createMany: createMany,
  deleteMany: deleteMany,
};
