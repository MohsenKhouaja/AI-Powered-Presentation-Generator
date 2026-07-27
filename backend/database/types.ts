import {
  contexts,
  files,
  presentationAccessGrants,
  presentationShareLinks,
  presentations,
  slides,
  users,
} from "./drizzle/schema.js";

export type UserRow = Omit<typeof users.$inferSelect, "password">;
export type NewUserRow = Omit<typeof users.$inferInsert, "id">;

export type PresentationRow = typeof presentations.$inferSelect;
export type NewPresentationRow = Omit<typeof presentations.$inferInsert, "id">;
export type PresentationSummary = Omit<PresentationRow, "userId"> & {
  accessLevel: "owner" | "editor" | "viewer";
  capabilities: {
    view: boolean;
    viewSources: boolean;
    editContent: boolean;
    manageAccess: boolean;
    delete: boolean;
  };
};
export type PresentationDetail = PresentationSummary & {
  slides: SlideRow[];
  context: ContextWithFilesRow | null;
};

export type ContextRow = typeof contexts.$inferSelect;
export type NewContextRow = Omit<typeof contexts.$inferInsert, "id">;
export type ContextWithFilesRow = ContextRow & { files: downloadedFile[] };

export type SlideRow = typeof slides.$inferSelect;
export type NewSlideRow = Omit<typeof slides.$inferInsert, "id">;

export type FileRow = typeof files.$inferSelect;
export type NewFileRow = Omit<typeof files.$inferInsert, "id">;
export type downloadedFile = FileRow & { base64File: string };
export type uploadedFile = Omit<NewFileRow, "contextId">;

export type PresentationAccessGrantRow =
  typeof presentationAccessGrants.$inferSelect;
export type NewPresentationAccessGrant = {
  email: string;
  presentationId: string;
  permission: "viewer" | "editor";
  expiresAt?: Date;
};
export type PresentationShareLinkRow =
  typeof presentationShareLinks.$inferSelect;
