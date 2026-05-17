import { describe, expect, it } from "vitest";
import { parseRssResponse } from "./poller";

const entry = (overrides: Record<string, unknown> = {}) => ({
  id: { label: "100" },
  author: { name: { label: "Alice" } },
  title: { label: "Great" },
  content: { label: "Loved it" },
  "im:rating": { label: "5" },
  updated: { label: "2025-05-15T12:00:00Z" },
  ...overrides,
});

describe("parseRssResponse", () => {
  it("returns an empty array when feed.entry is missing", () => {
    expect(parseRssResponse("app1", {})).toEqual([]);
    expect(parseRssResponse("app1", { feed: {} })).toEqual([]);
  });

  it("parses an array of entries", () => {
    const data = {
      feed: { entry: [entry({ id: { label: "1" } }), entry({ id: { label: "2" } })] },
    };
    const result = parseRssResponse("app1", data);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("normalizes a single entry object into an array", () => {
    const data = { feed: { entry: entry({ id: { label: "solo" } }) } };
    const result = parseRssResponse("app1", data);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("solo");
  });

  it("maps RSS fields to Review shape and stamps appId", () => {
    const data = { feed: { entry: [entry()] } };
    const [r] = parseRssResponse("my-app", data);
    expect(r).toMatchObject({
      appId: "my-app",
      id: "100",
      author: "Alice",
      title: "Great",
      body: "Loved it",
      score: 5,
      updatedAt: "2025-05-15T12:00:00Z",
      deletedAt: null,
    });
  });

  it("parses score as an integer", () => {
    const data = { feed: { entry: [entry({ "im:rating": { label: "3" } })] } };
    const [r] = parseRssResponse("app1", data);
    expect(r.score).toBe(3);
  });

  it("returns null score when rating label is missing", () => {
    const data = { feed: { entry: [entry({ "im:rating": undefined })] } };
    const [r] = parseRssResponse("app1", data);
    expect(r.score).toBeNull();
  });

  it("filters out entries missing id or updatedAt", () => {
    const data = {
      feed: {
        entry: [
          entry({ id: { label: "" } }),
          entry({ updated: { label: "" } }),
          entry({ id: { label: "valid" } }),
        ],
      },
    };
    const result = parseRssResponse("app1", data);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("valid");
  });

  it("coerces non-string body via String()", () => {
    const data = { feed: { entry: [entry({ content: { label: 12345 } })] } };
    const [r] = parseRssResponse("app1", data);
    expect(r.body).toBe("12345");
  });
});
