import {
  contexts,
  editAccess,
  files,
  presentations,
  slides,
  users,
} from "./drizzle/schema.js";

export type UserRow = Omit<typeof users.$inferSelect, "password">;
export type NewUserRow = Omit<typeof users.$inferInsert, "id">;

export type PresentationRow = typeof presentations.$inferSelect;
export type NewPresentationRow = Omit<typeof presentations.$inferInsert, "id">;
export type presentationDetail = PresentationRow & {
  slides: SlideRowWithContent[];
  context: ContextWithFilesRow;
  AccessType: "own" | "edit";
};

export type ContextRow = typeof contexts.$inferSelect;
export type NewContextRow = Omit<typeof contexts.$inferInsert, "id">;
export type ContextWithFilesRow = ContextRow & { files: downloadedFile[] };

export type SlideRow = typeof slides.$inferSelect;
export type SlideRowWithContent = typeof slides.$inferSelect & {
  content: string;
};
export type NewSlideRow = Omit<typeof slides.$inferInsert, "id">;

export type FileRow = typeof files.$inferSelect;
export type NewFileRow = Omit<typeof files.$inferInsert, "id">;
export type downloadedFile = FileRow & { base64File: string };
export type uploadedFile = Omit<NewFileRow, "contextId">;

export type EditAccessRow = typeof editAccess.$inferSelect;
export type NewEditAccessRow = {
  email: string;
  presentationId: string;
  expiresAt?: Date;
};
