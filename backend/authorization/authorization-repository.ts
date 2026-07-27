import type { UUID } from "node:crypto";
import type { DBContext } from "../database/index.js";

export type AuthorizationPresentation = {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
};

export type AuthorizationGrant = {
  permission: "viewer" | "editor";
  expiresAt: Date | null;
};

export type AuthorizationShareLink = {
  expiresAt: Date | null;
  revokedAt: Date | null;
  presentation: {
    id: string;
    title: string;
    userId: string;
  } | null;
};

export interface AuthorizationRepository {
  findPresentation(id: UUID): Promise<AuthorizationPresentation | undefined>;
  findGrant(
    presentationId: UUID,
    userId: UUID,
  ): Promise<AuthorizationGrant | undefined>;
  findShareLink(tokenHash: string): Promise<AuthorizationShareLink | undefined>;
}

export const createDrizzleAuthorizationRepository = (
  db: DBContext,
): AuthorizationRepository => ({
  findPresentation: (id) =>
    db.query.presentations.findFirst({
      where: { id },
      columns: { id: true, userId: true, title: true, createdAt: true },
    }),
  findGrant: (presentationId, userId) =>
    db.query.presentationAccessGrants.findFirst({
      where: { presentationId, userId },
      columns: { permission: true, expiresAt: true },
    }),
  findShareLink: (tokenHash) =>
    db.query.presentationShareLinks.findFirst({
      where: { tokenHash },
      columns: {
        presentationId: true,
        expiresAt: true,
        revokedAt: true,
      },
      with: {
        presentation: {
          columns: { id: true, title: true, userId: true },
        },
      },
    }),
});
