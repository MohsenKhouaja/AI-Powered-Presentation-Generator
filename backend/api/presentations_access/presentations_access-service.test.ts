import type { UUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { hashShareToken } from "../../authorization/presentation-authorization.js";
import type { DBContext } from "../../database/index.js";
import { accessService } from "./presentations_access-service.js";

describe("createOrRotateShareLink", () => {
  it("returns the bearer URL once and persists only its fingerprint", async () => {
    const insertValues = vi.fn().mockResolvedValue(undefined);
    const db = {
      query: {
        presentations: {
          findFirst: vi.fn().mockResolvedValue({
            id: "presentation",
            userId: "owner",
            title: "Deck",
            createdAt: new Date("2026-07-27T10:00:00.000Z"),
          }),
        },
        presentationAccessGrants: {
          findFirst: vi.fn(),
        },
        presentationShareLinks: {
          findFirst: vi.fn().mockResolvedValue(undefined),
        },
      },
      insert: vi.fn(() => ({ values: insertValues })),
    } as unknown as DBContext;

    const result = await accessService.createOrRotateShareLink(
      db,
      "owner" as UUID,
      "presentation" as UUID,
      null,
    );

    const token = new URL(result.shareUrl).hash.replace("#token=", "");
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        presentationId: "presentation",
        tokenHash: hashShareToken(token),
      }),
    );
    expect(JSON.stringify(insertValues.mock.calls)).not.toContain(token);
  });
});
