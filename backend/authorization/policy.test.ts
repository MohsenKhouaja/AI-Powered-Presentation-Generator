import { describe, expect, it } from "vitest";
import { evaluatePresentationPolicy } from "./policy.js";

const now = new Date("2026-07-27T12:00:00.000Z");

describe("evaluatePresentationPolicy", () => {
  it("allows an owner to perform every presentation action", () => {
    const decision = evaluatePresentationPolicy({
      subject: { userId: "owner" },
      resource: { ownerId: "owner" },
      relationship: {},
      environment: { now },
    });

    expect(decision).toEqual({
      accessLevel: "owner",
      capabilities: {
        view: true,
        viewSources: true,
        editContent: true,
        manageAccess: true,
        delete: true,
      },
    });
  });

  it("allows an active editor to change content but not manage access or delete", () => {
    const decision = evaluatePresentationPolicy({
      subject: { userId: "editor" },
      resource: { ownerId: "owner" },
      relationship: {
        grant: {
          permission: "editor",
          expiresAt: new Date("2026-07-28T12:00:00.000Z"),
        },
      },
      environment: { now },
    });

    expect(decision).toEqual({
      accessLevel: "editor",
      capabilities: {
        view: true,
        viewSources: true,
        editContent: true,
        manageAccess: false,
        delete: false,
      },
    });
  });

  it("limits a viewer to title and slides", () => {
    const decision = evaluatePresentationPolicy({
      subject: { userId: "viewer" },
      resource: { ownerId: "owner" },
      relationship: {
        grant: { permission: "viewer", expiresAt: null },
      },
      environment: { now },
    });

    expect(decision).toEqual({
      accessLevel: "viewer",
      capabilities: {
        view: true,
        viewSources: false,
        editContent: false,
        manageAccess: false,
        delete: false,
      },
    });
  });

  it("allows an anonymous visitor to view through an active share link", () => {
    const decision = evaluatePresentationPolicy({
      subject: { userId: null },
      resource: { ownerId: "owner" },
      relationship: {
        shareLink: { expiresAt: null, revokedAt: null },
      },
      environment: { now },
    });

    expect(decision.accessLevel).toBe("link");
    expect(decision.capabilities).toEqual({
      view: true,
      viewSources: false,
      editContent: false,
      manageAccess: false,
      delete: false,
    });
  });

  it.each([
    {
      relationship: {
        grant: {
          permission: "editor" as const,
          expiresAt: new Date("2026-07-27T12:00:00.000Z"),
        },
      },
    },
    {
      relationship: {
        shareLink: {
          expiresAt: new Date("2026-07-27T11:59:59.000Z"),
          revokedAt: null,
        },
      },
    },
    {
      relationship: {
        shareLink: {
          expiresAt: null,
          revokedAt: new Date("2026-07-27T11:00:00.000Z"),
        },
      },
    },
  ])("denies expired or revoked access", ({ relationship }) => {
    const decision = evaluatePresentationPolicy({
      subject: { userId: "other" },
      resource: { ownerId: "owner" },
      relationship,
      environment: { now },
    });

    expect(decision.accessLevel).toBe("none");
    expect(decision.capabilities.view).toBe(false);
  });
});
