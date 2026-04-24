export const queryKeys = {
  auth: {
    session: () => ["auth", "session"] as const,
  },
  presentations: {
    all: () => ["presentations"] as const,
    details: () => ["presentations", "detail"] as const,
    detail: (presentationId: string) =>
      ["presentations", "detail", presentationId] as const,
  },
  contexts: {
    all: () => ["contexts"] as const,
    byPresentation: (presentationId: string) =>
      ["contexts", "presentation", presentationId] as const,
    detail: (contextId: string) => ["contexts", "detail", contextId] as const,
    files: (contextId: string) => ["contexts", "files", contextId] as const,
  },
  share: {
    root: () => ["share", "readonly"] as const,
    presentationAccess: (presentationId: string) =>
      ["share", "readonly", "presentation", presentationId, "access"] as const,
  },
} as const;
