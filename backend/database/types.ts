import { contexts, editAccess, files, presentations, slides, users } from "./drizzle/schema.js";

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