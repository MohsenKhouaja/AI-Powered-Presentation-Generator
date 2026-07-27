import type { UUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { AuthorizationRepository } from "./authorization-repository.js";
import {
  hashShareToken,
  requirePresentationAccessFromRepository,
  requireShareLinkAccessFromRepository,
} from "./presentation-authorization.js";

const presentation = {
  id: "presentation",
  userId: "owner",
  title: "ABAC deck",
  createdAt: new Date("2026-07-27T10:00:00.000Z"),
};

const testRepository = (options?: {
  grant?: { permission: "viewer" | "editor"; expiresAt: Date | null };
  shareLink?: {
    expiresAt: Date | null;
    revokedAt: Date | null;
    presentation: { id: string; title: string; userId: string };
  };
}) =>
  ({
    findPresentation: vi.fn().mockResolvedValue(presentation),
    findGrant: vi.fn().mockResolvedValue(options?.grant),
    findShareLink: vi.fn().mockResolvedValue(options?.shareLink),
  }) satisfies AuthorizationRepository;

describe("requirePresentationAccess", () => {
  it("conceals a presentation from a user without a relationship", async () => {
    await expect(
      requirePresentationAccessFromRepository(testRepository(), {
        userId: "outsider" as UUID,
        presentationId: "presentation" as UUID,
        action: "view",
      }),
    ).rejects.toMatchObject({
      status: 404,
      code: "PRESENTATION_NOT_FOUND",
    });
  });

  it("returns forbidden when a viewer attempts a visible mutation", async () => {
    await expect(
      requirePresentationAccessFromRepository(
        testRepository({ grant: { permission: "viewer", expiresAt: null } }),
        {
          userId: "viewer" as UUID,
          presentationId: "presentation" as UUID,
          action: "editContent",
        },
      ),
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });
  });
});

describe("requireShareLinkAccess", () => {
  it("looks up only the fingerprint and returns link access", async () => {
    const token = "a".repeat(43);
    const repository = testRepository({
      shareLink: {
        expiresAt: null,
        revokedAt: null,
        presentation: {
          id: "presentation",
          title: "ABAC deck",
          userId: "owner",
        },
      },
    });

    const result = await requireShareLinkAccessFromRepository(repository, {
      token,
    });

    expect(repository.findShareLink).toHaveBeenCalledWith(hashShareToken(token));
    expect(result).toMatchObject({
      accessLevel: "link",
      presentation: { id: "presentation", title: "ABAC deck" },
    });
  });

  it.each([
    {
      expiresAt: new Date("2026-07-27T11:59:59.000Z"),
      revokedAt: null,
    },
    {
      expiresAt: null,
      revokedAt: new Date("2026-07-27T11:00:00.000Z"),
    },
  ])("conceals expired or revoked links", async ({ expiresAt, revokedAt }) => {
    const repository = testRepository({
      shareLink: {
        expiresAt,
        revokedAt,
        presentation: {
          id: "presentation",
          title: "ABAC deck",
          userId: "owner",
        },
      },
    });

    await expect(
      requireShareLinkAccessFromRepository(repository, {
        token: "a".repeat(43),
        now: new Date("2026-07-27T12:00:00.000Z"),
      }),
    ).rejects.toMatchObject({ status: 404, code: "SHARE_UNAVAILABLE" });
  });

  it("rejects an old token after the repository no longer recognizes its hash", async () => {
    const repository = testRepository();

    await expect(
      requireShareLinkAccessFromRepository(repository, {
        token: "o".repeat(43),
      }),
    ).rejects.toMatchObject({ status: 404, code: "SHARE_UNAVAILABLE" });
    expect(repository.findShareLink).toHaveBeenCalledWith(
      hashShareToken("o".repeat(43)),
    );
  });
});
