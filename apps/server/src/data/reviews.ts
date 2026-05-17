import type { Review } from "@ios-reviews/types";

export const reviews: Review[] = [
  {
    id: "r-0001",
    appId: "284882215",
    author: "jane.doe",
    title: "Solid update",
    body: "The latest release fixed the issue I was seeing on launch. Smooth now.",
    score: 5,
    submittedAt: "2025-01-12T09:24:11.000Z",
    deletedAt: null,
  },
  {
    id: "r-0002",
    appId: "284882215",
    author: "mholden",
    title: "Crashes on iPad",
    body: "App force-closes when opening notifications. Please fix.",
    score: 2,
    submittedAt: "2025-02-03T17:08:42.000Z",
    deletedAt: null,
  },
  {
    id: "r-0003",
    appId: "310633997",
    author: "ali_98",
    title: "Best messaging app",
    body: "Voice notes feel snappier this week. Great work.",
    score: 4,
    submittedAt: "2025-03-21T11:55:03.000Z",
    deletedAt: null,
  },
];
