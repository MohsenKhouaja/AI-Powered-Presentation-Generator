import {
  bigint,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";
import { defineRelationsPart, sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .default(sql`(UUID())`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
});

export const presentations = mysqlTable("presentations", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .default(sql`(UUID())`),
  title: varchar("title", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contexts = mysqlTable(
  "contexts",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .default(sql`(UUID())`),
    prompt: text("prompt").notNull().default(""),
    presentationId: varchar("presentation_id", { length: 255 })
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("contexts_presentation_id_unique").on(table.presentationId),
  ],
);

export const slides = mysqlTable(
  "slides",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .default(sql`(UUID())`),
    presentationId: varchar("presentation_id", { length: 255 })
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
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
  id: varchar("id", { length: 255 })
    .primaryKey()
    .default(sql`(UUID())`),
  contextId: varchar("context_id", { length: 255 })
    .notNull()
    .references(() => contexts.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  originalName: text("original_name").notNull(),
});

export const presentationAccessGrants = mysqlTable(
  "presentation_access_grants",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .default(sql`(UUID())`),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    presentationId: varchar("presentation_id", { length: 255 })
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    permission: mysqlEnum("permission", ["viewer", "editor"])
      .notNull()
      .default("editor"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    unique("presentation_access_grants_user_presentation_unique").on(
      table.userId,
      table.presentationId,
    ),
  ],
);

export const presentationShareLinks = mysqlTable(
  "presentation_share_links",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .default(sql`(UUID())`),
    presentationId: varchar("presentation_id", { length: 255 })
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    unique("presentation_share_links_presentation_unique").on(
      table.presentationId,
    ),
  ],
);

// Relations Schema (for defineRelationsPart)
const tablesSchema = {
  users,
  presentations,
  contexts,
  slides,
  files,
  presentationAccessGrants,
  presentationShareLinks,
};

export const usersRelations = defineRelationsPart(tablesSchema, (r) => ({
  users: {
    presentations: r.many.presentations({
      from: r.users.id,
      to: r.presentations.userId,
    }),
    accessGrants: r.many.presentationAccessGrants({
      from: r.users.id,
      to: r.presentationAccessGrants.userId,
    }),
  },
}));

export const presentationsRelations = defineRelationsPart(
  tablesSchema,
  (r) => ({
    presentations: {
      user: r.one.users({
        from: r.presentations.userId,
        to: r.users.id,
      }),
      contexts: r.one.contexts({
        from: r.presentations.id,
        to: r.contexts.presentationId,
      }),
      slides: r.many.slides({
        from: r.presentations.id,
        to: r.slides.presentationId,
      }),
      accessGrants: r.many.presentationAccessGrants({
        from: r.presentations.id,
        to: r.presentationAccessGrants.presentationId,
      }),
      shareLink: r.one.presentationShareLinks({
        from: r.presentations.id,
        to: r.presentationShareLinks.presentationId,
      }),
    },
  }),
);

export const contextsRelations = defineRelationsPart(tablesSchema, (r) => ({
  contexts: {
    presentation: r.one.presentations({
      from: r.contexts.presentationId,
      to: r.presentations.id,
    }),
    files: r.many.files({
      from: r.contexts.id,
      to: r.files.contextId,
    }),
  },
}));

export const slidesRelations = defineRelationsPart(tablesSchema, (r) => ({
  slides: {
    presentation: r.one.presentations({
      from: r.slides.presentationId,
      to: r.presentations.id,
    }),
  },
}));

export const filesRelations = defineRelationsPart(tablesSchema, (r) => ({
  files: {
    context: r.one.contexts({
      from: r.files.contextId,
      to: r.contexts.id,
    }),
  },
}));

export const presentationAccessGrantsRelations = defineRelationsPart(
  tablesSchema,
  (r) => ({
    presentationAccessGrants: {
      user: r.one.users({
        from: r.presentationAccessGrants.userId,
        to: r.users.id,
      }),
      presentation: r.one.presentations({
        from: r.presentationAccessGrants.presentationId,
        to: r.presentations.id,
      }),
    },
  }),
);

export const presentationShareLinksRelations = defineRelationsPart(
  tablesSchema,
  (r) => ({
    presentationShareLinks: {
      presentation: r.one.presentations({
        from: r.presentationShareLinks.presentationId,
        to: r.presentations.id,
      }),
    },
  }),
);

/*
 * Keep every relationship in the shared relation registry so Drizzle query
 * helpers expose the same vocabulary to authorization and domain modules.
 */
export const relations = {
  ...defineRelationsPart(tablesSchema),
  ...usersRelations,
  ...presentationsRelations,
  ...contextsRelations,
  ...slidesRelations,
  ...filesRelations,
  ...presentationAccessGrantsRelations,
  ...presentationShareLinksRelations,
};
