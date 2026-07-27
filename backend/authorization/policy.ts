export type PresentationAction =
  | "view"
  | "viewSources"
  | "editContent"
  | "manageAccess"
  | "delete";

export type PresentationAccessLevel =
  | "owner"
  | "editor"
  | "viewer"
  | "link"
  | "none";

export type PresentationCapabilities = Record<PresentationAction, boolean>;

export type PresentationAuthorizationDecision = {
  accessLevel: PresentationAccessLevel;
  capabilities: PresentationCapabilities;
};

export type PresentationPolicyAttributes = {
  subject: { userId: string | null };
  resource: { ownerId: string };
  relationship: {
    grant?: {
      permission: "viewer" | "editor";
      expiresAt: Date | null;
    };
    shareLink?: {
      expiresAt: Date | null;
      revokedAt: Date | null;
    };
  };
  environment: { now: Date };
};

const noCapabilities: PresentationCapabilities = {
  view: false,
  viewSources: false,
  editContent: false,
  manageAccess: false,
  delete: false,
};

const viewCapabilities: PresentationCapabilities = {
  ...noCapabilities,
  view: true,
};

const editorCapabilities: PresentationCapabilities = {
  ...viewCapabilities,
  viewSources: true,
  editContent: true,
};

const ownerCapabilities: PresentationCapabilities = {
  view: true,
  viewSources: true,
  editContent: true,
  manageAccess: true,
  delete: true,
};

const isActive = (expiresAt: Date | null, now: Date): boolean =>
  expiresAt === null || expiresAt.getTime() > now.getTime();

export function evaluatePresentationPolicy(
  attributes: PresentationPolicyAttributes,
): PresentationAuthorizationDecision {
  const { subject, resource, relationship, environment } = attributes;

  if (subject.userId && subject.userId === resource.ownerId) {
    return { accessLevel: "owner", capabilities: ownerCapabilities };
  }

  if (
    subject.userId &&
    relationship.grant &&
    isActive(relationship.grant.expiresAt, environment.now)
  ) {
    return relationship.grant.permission === "editor"
      ? { accessLevel: "editor", capabilities: editorCapabilities }
      : { accessLevel: "viewer", capabilities: viewCapabilities };
  }

  if (
    relationship.shareLink &&
    relationship.shareLink.revokedAt === null &&
    isActive(relationship.shareLink.expiresAt, environment.now)
  ) {
    return { accessLevel: "link", capabilities: viewCapabilities };
  }

  return { accessLevel: "none", capabilities: noCapabilities };
}
