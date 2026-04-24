import type { SharedFile, SharedPresentationRef } from "@p2m/contracts/types";

export interface PresentationCardModel {
  reference: SharedPresentationRef;
  canEdit: boolean;
}

export type UploadCardModel = Pick<
  SharedFile,
  "id" | "originalName" | "mimeType" | "sizeBytes"
>;
