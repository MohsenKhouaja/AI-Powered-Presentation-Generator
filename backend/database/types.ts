import type { UUID } from "node:crypto";
import type {
  ContextRow,
  FileRow,
  NewContextRow,
  NewFileRow,
  NewSlideRow,
  NewUserRow,
  SlideRow,
  UserRow,
} from "./drizzle/schema.js";

const toDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value as string | number);
};

export type User = Pick<UserRow, "id" | "username" | "email">;
export type userInsert = Omit<NewUserRow, "id">;

export type AccessType = "edit" | "own";

export type Presentation = {
  readonly id: string;
  title: string;
  readonly userId: UUID;
  readonly contextId?: UUID;
  readonly createdAt: Date;
  AccessType: AccessType | null;
};
export type presentationInsert = Omit<
  Presentation,
  "id" | "createdAt" | "AccessType"
>;

export type PresentationDetail = Presentation & {
  slides: Slide[];
  context: Context | null;
};

export type Slide = SlideRow;
export type slideInsert = NewSlideRow;

export type Context = ContextRow;
export type contextInsert = Pick<NewContextRow, "prompt">;
export type contextUpdate = Pick<Context, "id" | "prompt">;

export type File = FileRow;
export type fileInsert = NewFileRow;

export type EditAccess = {
  id: UUID;
  email: string;
  presentationId: UUID;
  expiresAt: Date | null;
};
export type editAccessInsert = Omit<EditAccess, "id">;

export const serializeUser = (row: any): User => ({
  id: row.id ?? row.user_id,
  username: row.username,
  email: row.email,
});

export const serializePresentation = (
  row: any,
  accessType?: "edit" | "own",
): Presentation => ({
  id: row.id ?? row.presentation_id,
  title: row.title,
  createdAt: toDate(row.createdAt ?? row.created_at),
  userId: row.userId ?? row.user_id,
  AccessType: accessType ?? null,
  contextId: row.contextId ?? row.context_id,
});

export const serializeSlide = (row: any, content: string): Slide => ({
  id: row.id ?? row.slide_id,
  content: row.content ?? content,
  presentationId: row.presentationId ?? row.presentation_id,
  slideOrder: row.slideOrder ?? row.slide_order,
});

export const serializeContext = (row: any): Context => ({
  id: row.id ?? row.context_id,
  prompt: row.prompt,
  presentationId: row.presentationId ?? row.presentation_id ?? null,
});

export const serializeFile = (row: any): File => ({
  id: row.id ?? row.file_id,
  contextId: row.contextId ?? row.context_id,
  storageKey: row.storageKey ?? row.storage_key,
  mimeType: row.mimeType ?? row.mime_type,
  fileType: row.fileType ?? row.file_type,
  sizeBytes: row.sizeBytes ?? row.size_bytes,
  originalName: row.originalName ?? row.original_name,
});

export const serializePresentationDetail = (row: any): PresentationDetail => ({
  id: row.id ?? row.presentation_id,
  title: row.title,
  createdAt: toDate(row.createdAt ?? row.created_at),
  userId: row.userId ?? row.user_id,
  slides: row.slides ?? [],
  contextId: row.contextId ?? row.context_id,
  context: row.context ?? row.presentation_context ?? null,
  AccessType: (row.AccessType ??
    row.accessType ??
    row.access_type ??
    null) as AccessType | null,
});
