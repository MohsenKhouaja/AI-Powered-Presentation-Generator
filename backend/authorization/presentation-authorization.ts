import { createHash } from "node:crypto";
import type { UUID } from "node:crypto";
import type { DBContext } from "../database/index.js";
import { forbidden, notFound } from "../errors/http-error.js";
import { createDrizzleAuthorizationRepository } from "./authorization-repository.js";
import type { AuthorizationRepository } from "./authorization-repository.js";
import {
  evaluatePresentationPolicy,
  type PresentationAccessLevel,
  type PresentationAction,
  type PresentationCapabilities,
} from "./policy.js";

export type AuthorizedPresentation = {
  presentation: {
    id: string;
    userId: string;
    title: string;
    createdAt: Date;
  };
  accessLevel: Exclude<PresentationAccessLevel, "none" | "link">;
  capabilities: PresentationCapabilities;
};

export type AuthorizedSharedPresentation = {
  presentation: {
    id: string;
    title: string;
  };
  accessLevel: "link";
  capabilities: PresentationCapabilities;
};

export const hashShareToken = (token: string): string =>
  createHash("sha256").update(token, "utf8").digest("hex");

export async function requirePresentationAccess(
  db: DBContext,
  input: {
    userId: UUID;
    presentationId: UUID;
    action: PresentationAction;
    now?: Date;
  },
): Promise<AuthorizedPresentation> {
  return requirePresentationAccessFromRepository(
    createDrizzleAuthorizationRepository(db),
    input,
  );
}

export async function requirePresentationAccessFromRepository(
  repository: AuthorizationRepository,
  input: {
    userId: UUID;
    presentationId: UUID;
    action: PresentationAction;
    now?: Date;
  },
): Promise<AuthorizedPresentation> {
  const presentation = await repository.findPresentation(input.presentationId);

  if (!presentation) {
    throw notFound();
  }

  const grant =
    presentation.userId === input.userId
      ? undefined
      : await repository.findGrant(input.presentationId, input.userId);

  const decision = evaluatePresentationPolicy({
    subject: { userId: input.userId },
    resource: { ownerId: presentation.userId },
    relationship: {
      grant: grant
        ? {
            permission: grant.permission,
            expiresAt: grant.expiresAt,
          }
        : undefined,
    },
    environment: { now: input.now ?? new Date() },
  });

  if (!decision.capabilities.view) {
    throw notFound();
  }

  if (!decision.capabilities[input.action]) {
    throw forbidden();
  }

  return {
    presentation,
    accessLevel: decision.accessLevel as AuthorizedPresentation["accessLevel"],
    capabilities: decision.capabilities,
  };
}

export async function requireShareLinkAccess(
  db: DBContext,
  input: { token: string; now?: Date },
): Promise<AuthorizedSharedPresentation> {
  return requireShareLinkAccessFromRepository(
    createDrizzleAuthorizationRepository(db),
    input,
  );
}

export async function requireShareLinkAccessFromRepository(
  repository: AuthorizationRepository,
  input: { token: string; now?: Date },
): Promise<AuthorizedSharedPresentation> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(input.token)) {
    throw notFound("Shared presentation is unavailable", "SHARE_UNAVAILABLE");
  }

  const shareLink = await repository.findShareLink(hashShareToken(input.token));

  if (!shareLink?.presentation) {
    throw notFound("Shared presentation is unavailable", "SHARE_UNAVAILABLE");
  }

  const decision = evaluatePresentationPolicy({
    subject: { userId: null },
    resource: { ownerId: shareLink.presentation.userId },
    relationship: {
      shareLink: {
        expiresAt: shareLink.expiresAt,
        revokedAt: shareLink.revokedAt,
      },
    },
    environment: { now: input.now ?? new Date() },
  });

  if (!decision.capabilities.view) {
    throw notFound("Shared presentation is unavailable", "SHARE_UNAVAILABLE");
  }

  return {
    presentation: {
      id: shareLink.presentation.id,
      title: shareLink.presentation.title,
    },
    accessLevel: "link",
    capabilities: decision.capabilities,
  };
}
