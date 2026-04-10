import { randomUUID } from "node:crypto";
import { SQL } from "sql-template-strings";
import { pool } from "../../database/index.js";
import type { contextInsert, fileInsert } from "../../database/types.js";
import { fileService } from "../files/files-service.js";

const create = async (context: contextInsert, files: fileInsert[]) => {
  const contextId = randomUUID();
  const query = SQL`insert into contexts (id, prompt, presentation_id) values (${contextId}, ${context.prompt}, ${context.presentationId})`;
  await pool.query(query);
  if (files.length > 0) {
    await fileService.createMany(files);
  }
};

export const contextService = {
  create: create,
};
