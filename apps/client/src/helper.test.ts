import { describe, expect, it } from "vitest";
import { formatTimestamp, getScoreLevel, ScoreLevel } from "./helper";

describe("formatTimestamp", () => {
  it("formats a valid ISO string into a non-empty localized string", () => {
    const formatted = formatTimestamp("2025-05-15T14:30:00Z");
    expect(formatted).toBeTypeOf("string");
    expect(formatted.length).toBeGreaterThan(0);
    // Should contain year (locale-agnostic check)
    expect(formatted).toMatch(/2025/);
  });

  it("is locale-stable across calls (same input -> same output)", () => {
    const a = formatTimestamp("2025-01-02T03:04:05Z");
    const b = formatTimestamp("2025-01-02T03:04:05Z");
    expect(a).toBe(b);
  });
});

describe("getScoreLevel", () => {
  it("returns High for scores >= 4", () => {
    expect(getScoreLevel(4)).toBe(ScoreLevel.High);
    expect(getScoreLevel(5)).toBe(ScoreLevel.High);
    expect(getScoreLevel(10)).toBe(ScoreLevel.High);
  });

  it("returns Medium for score === 3", () => {
    expect(getScoreLevel(3)).toBe(ScoreLevel.Medium);
  });

  it("returns Low for scores <= 2", () => {
    expect(getScoreLevel(2)).toBe(ScoreLevel.Low);
    expect(getScoreLevel(1)).toBe(ScoreLevel.Low);
    expect(getScoreLevel(0)).toBe(ScoreLevel.Low);
  });
});
