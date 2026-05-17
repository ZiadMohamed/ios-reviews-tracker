import * as fs from "fs";
import * as path from "path";
import { Review } from "@ios-reviews/types";

const reviewsPath = path.join(__dirname, "reviews.json");

let store: Record<string, Review[]> = {};
const initializedApps = new Set<string>();

export function setAppReady(appId: string): void {
  initializedApps.add(appId);
}

export function getIsAppReady(appId: string): boolean {
  return initializedApps.has(appId);
}

export function initStore(): void {
  if (!fs.existsSync(reviewsPath)) {
    return;
  }
  try {
    const data = fs.readFileSync(reviewsPath, "utf-8");
    store = JSON.parse(data);
    console.log("Loaded reviews from disk");
    // Mark any app that already has data as ready
    Object.keys(store).forEach((appId) => {
      initializedApps.add(appId);
    });
  } catch (error) {
    console.error("Failed to load reviews from disk:", error);
  }
}

export function getReviews(appId?: string, cutoffDate?: number): Review[] {
  const reviews = appId ? store[appId] || [] : Object.values(store).flat();
  return reviews.filter((review) => {
    if (review.deletedAt) return false;
    if (cutoffDate && new Date(review.updatedAt).getTime() < cutoffDate) return false;
    return true;
  });
}

function persist(): void {
  fs.writeFileSync(reviewsPath, JSON.stringify(store, null, 2));
}

// Upserts reviews to disk
export function upsertReviews(appId: string, fetchedReviews: Review[]): void {
  if (!store?.[appId]) {
    store ||= {};
    store[appId] = [];
  }

  fetchedReviews.forEach((review) => {
    const existingReviewIndex = store[appId].findIndex((r) => r.id === review.id);
    if (existingReviewIndex === -1) {
      store[appId].push(review);
    } else {
      store[appId][existingReviewIndex] = { ...review };
    }
  });

  persist();
}

// Soft deletes any reviews that are not in the list or not within WINDOW_MS
export function softDeleteReviews(appId: string, fetchedReviews: Review[], cutoffDate: number) {
  const fetchedReviewsIds = new Set(fetchedReviews.map((review) => review.id));
  const currentTimestamp = new Date().toISOString();

  store[appId] = store[appId].map((review) => {
    if (!fetchedReviewsIds.has(review.id) || new Date(review.updatedAt).getTime() < cutoffDate) {
      return {
        ...review,
        deletedAt: currentTimestamp,
      };
    }
    return review;
  });

  persist();
}
