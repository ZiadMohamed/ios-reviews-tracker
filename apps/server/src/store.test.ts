import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Review } from "@ios-reviews/types";

// Mock fs so the store doesn't read/write real files during tests.
vi.mock("fs", () => ({
  existsSync: vi.fn().mockReturnValue(false),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const review = (overrides: Partial<Review> = {}): Review => ({
  id: "r1",
  appId: "app1",
  author: "Alice",
  title: "Title",
  body: "Body",
  score: 5,
  // Default to "now" so reviews fall inside the 48h window unless overridden.
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  ...overrides,
});

// Re-import store fresh in each test so module-level `store` state is isolated.
async function loadStore() {
  vi.resetModules();
  return await import("./store");
}

describe("store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("upsertReviews", () => {
    it("inserts new reviews for a previously empty app", async () => {
      const { upsertReviews, getReviews } = await loadStore();
      const r = review({ id: "r1" });

      upsertReviews("app1", [r]);

      expect(getReviews("app1")).toEqual([r]);
    });

    it("updates an existing review by id", async () => {
      const { upsertReviews, getReviews } = await loadStore();
      const original = review({ id: "r1", body: "old" });
      const updated = review({ id: "r1", body: "new" });

      upsertReviews("app1", [original]);
      upsertReviews("app1", [updated]);

      const result = getReviews("app1");
      expect(result).toHaveLength(1);
      expect(result[0].body).toBe("new");
    });

    it("does not soft-delete reviews missing from the fetched list", async () => {
      const { upsertReviews, getReviews } = await loadStore();
      const a = review({ id: "a" });
      const b = review({ id: "b" });

      upsertReviews("app1", [a, b]);
      // Re-upsert with only `a` -- `b` should remain visible (not soft-deleted)
      upsertReviews("app1", [a]);

      const ids = getReviews("app1").map((r) => r.id);
      expect(ids).toContain("a");
      expect(ids).toContain("b");
    });
  });

  describe("softDeleteReviews", () => {
    it("soft-deletes reviews whose id is not in the fetched list", async () => {
      const { upsertReviews, softDeleteReviews, getReviews } = await loadStore();
      const a = review({ id: "a" });
      const b = review({ id: "b" });
      upsertReviews("app1", [a, b]);

      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      softDeleteReviews("app1", [a], cutoff);

      const visible = getReviews("app1");
      expect(visible.map((r) => r.id)).toEqual(["a"]);
    });

    it("soft-deletes reviews older than the cutoff date", async () => {
      const { upsertReviews, softDeleteReviews, getReviews } = await loadStore();
      const fresh = review({ id: "fresh", updatedAt: new Date().toISOString() });
      const stale = review({
        id: "stale",
        updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      });
      upsertReviews("app1", [fresh, stale]);

      const cutoff = Date.now() - 48 * 60 * 60 * 1000;
      softDeleteReviews("app1", [fresh, stale], cutoff);

      const visible = getReviews("app1");
      expect(visible.map((r) => r.id)).toEqual(["fresh"]);
    });
  });

  describe("getReviews", () => {
    it("filters out soft-deleted reviews", async () => {
      const { upsertReviews, softDeleteReviews, getReviews } = await loadStore();
      const a = review({ id: "a" });
      const b = review({ id: "b" });
      upsertReviews("app1", [a, b]);

      softDeleteReviews("app1", [a], Date.now() - 48 * 60 * 60 * 1000);

      expect(getReviews("app1").map((r) => r.id)).toEqual(["a"]);
    });

    it("returns reviews from all apps when called with no appId", async () => {
      const { upsertReviews, getReviews } = await loadStore();
      upsertReviews("app1", [review({ id: "a", appId: "app1" })]);
      upsertReviews("app2", [review({ id: "b", appId: "app2" })]);

      const all = getReviews();
      expect(all.map((r) => r.id).sort()).toEqual(["a", "b"]);
    });

    it("returns an empty array for an unknown app", async () => {
      const { getReviews } = await loadStore();
      expect(getReviews("nope")).toEqual([]);
    });
  });
});
