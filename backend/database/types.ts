import { UUID } from "node:crypto";

const toDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value as string | number);
};

export type User = {
  readonly id: UUID;
  readonly username: string;
  readonly email: string;
};
export type userInsert = User & { readonly password: string };

export type AccessType = "edit" | "own";

export type Presentation = {
  readonly id: string;
  title: string;
  readonly userId: UUID;
  readonly createdAt: Date;
  AccessType: AccessType | null;
};
export type presentationInsert = Omit<Presentation, "createdAt">;

export type PresentationDetail = Presentation & {
  slides: Slide[];
  context: Context | null;
};

export type Slide = {
  id: UUID;
  content: string;
  presentationId: UUID;
  slideOrder: number;
};
export type slideInsert = Slide;

export type Context = {
  id: UUID;
  prompt: string;
  presentationId: UUID;
};
export type contextInsert = Context;
export type contextUpdate = Omit<contextInsert, "presentationId">;

export type File = {
  id: UUID;
  contextId: UUID;
  storageKey: string;
  mimeType: string;
  fileType: string;
  sizeBytes: number;
};
export type fileInsert = File;

export type EditAccess = {
  id: UUID;
  email: string;
  presentationId: UUID;
  expiresAt: Date;
};
export type editAccessInsert = EditAccess;

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
  AccessType: accessType,
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
  presentationId: row.presentationId ?? row.presentation_id,
});

export const serializeFile = (row: any): File => ({
  id: row.id ?? row.file_id,
  contextId: row.contextId ?? row.context_id,
  storageKey: row.storageKey ?? row.storage_key,
  mimeType: row.mimeType ?? row.mime_type,
  fileType: row.fileType ?? row.file_type,
  sizeBytes: row.sizeBytes ?? row.size_bytes,
});

export const serializePresentationDetail = (row: any): PresentationDetail => ({
  id: row.id ?? row.presentation_id,
  title: row.title,
  createdAt: toDate(row.createdAt ?? row.created_at),
  userId: row.userId ?? row.user_id,
  slides: row.slides ?? [],
  context: row.context ?? row.presentation_context ?? null,
  AccessType: (row.AccessType ??
    row.accessType ??
    row.access_type ??
    null) as AccessType | null,
});
