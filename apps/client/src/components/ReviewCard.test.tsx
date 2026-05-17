import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Review } from "@ios-reviews/types";
import { ReviewCard } from "./ReviewCard";

const baseReview: Review = {
  id: "r1",
  appId: "389801252",
  author: "Alex Rivera",
  title: "Loving it",
  body: "The latest update fixed the notification bug.",
  score: 5,
  updatedAt: "2025-05-15T14:30:00Z",
  deletedAt: null,
};

describe("ReviewCard", () => {
  it("renders author, body and score", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
    expect(screen.getByText(baseReview.body)).toBeInTheDocument();
    expect(screen.getByText(/★ 5/)).toBeInTheDocument();
  });

  it("hides the score badge when score is null", () => {
    render(<ReviewCard review={{ ...baseReview, score: null }} />);
    expect(screen.queryByText(/★/)).not.toBeInTheDocument();
  });

  it("does not render appName when prop is omitted", () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.queryByText(/· /)).not.toBeInTheDocument();
  });

  it("renders appName next to the timestamp when prop is provided", () => {
    render(<ReviewCard review={baseReview} appName="Instagram" />);
    expect(screen.getByText(/· Instagram/)).toBeInTheDocument();
  });

  it("applies the High score badge class for scores >= 4", () => {
    render(<ReviewCard review={{ ...baseReview, score: 5 }} />);
    const badge = screen.getByText(/★ 5/);
    expect(badge.className).toMatch(/bg-green-100/);
  });

  it("applies the Medium score badge class for score === 3", () => {
    render(<ReviewCard review={{ ...baseReview, score: 3 }} />);
    const badge = screen.getByText(/★ 3/);
    expect(badge.className).toMatch(/bg-yellow-100/);
  });

  it("applies the Low score badge class for scores <= 2", () => {
    render(<ReviewCard review={{ ...baseReview, score: 1 }} />);
    const badge = screen.getByText(/★ 1/);
    expect(badge.className).toMatch(/bg-red-100/);
  });
});
