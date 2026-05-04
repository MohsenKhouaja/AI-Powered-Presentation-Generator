import {
  bigint,
  int,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const presentations = mysqlTable("presentations", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contexts = mysqlTable(
  "contexts",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    prompt: text("prompt").notNull().default(""),
    presentationId: varchar("presentation_id", { length: 255 }).references(
      () => presentations.id,
      { onDelete: "cascade" },
    ),
  },
  (table) => [
    unique("contexts_presentation_id_unique").on(table.presentationId),
  ],
);

export const slides = mysqlTable(
  "slides",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    presentationId: varchar("presentation_id", { length: 255 })
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    content: text("content").notNull().default(""),
    slideOrder: int("slide_order").notNull(),
  },
  (table) => [
    unique("slides_presentation_id_slide_order_unique").on(
      table.presentationId,
      table.slideOrder,
    ),
  ],
);

export const files = mysqlTable("files", {
  id: varchar("id", { length: 255 }).primaryKey(),
  contextId: varchar("context_id", { length: 255 })
    .notNull()
    .references(() => contexts.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  mimeType: text("mime_type").notNull(),
  fileType: text("file_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  originalName: text("original_name").notNull(),
});

export const editAccess = mysqlTable(
  "edit_access",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    presentationId: varchar("presentation_id", { length: 255 })
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    unique("edit_access_user_id_presentation_id_unique").on(
      table.userId,
      table.presentationId,
    ),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

export type PresentationRow = typeof presentations.$inferSelect;
export type NewPresentationRow = typeof presentations.$inferInsert;

export type ContextRow = typeof contexts.$inferSelect;
export type NewContextRow = typeof contexts.$inferInsert;

export type SlideRow = typeof slides.$inferSelect;
export type NewSlideRow = typeof slides.$inferInsert;

export type FileRow = typeof files.$inferSelect;
export type NewFileRow = typeof files.$inferInsert;

export type EditAccessRow = typeof editAccess.$inferSelect;
export type NewEditAccessRow = typeof editAccess.$inferInsert;
