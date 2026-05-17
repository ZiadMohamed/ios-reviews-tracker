import { App, Review } from "@ios-reviews/types";
import {
  apps,
  BETWEEN_APPS_DELAY_MS,
  FETCH_RETRY_DELAY_MS,
  MAX_PAGES,
  POLL_INTERVAL_MS,
  REVIEW_WINDOW_MS,
} from "./config";
import { upsertReviews, softDeleteReviews } from "./store";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchOnce(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response;
}

async function fetchWithRetry(url: string): Promise<Response> {
  try {
    return await fetchOnce(url);
  } catch {
    await sleep(FETCH_RETRY_DELAY_MS);
    return await fetchOnce(url);
  }
}

const rssUrl = (appId: string, page: number) =>
  `https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/page=${page}/json`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRssResponse(appId: string, data: any): Review[] {
  const rawEntries = data?.feed?.entry ?? [];
  // defensive code in case a single review is returned instead of an array
  const entries = Array.isArray(rawEntries) ? rawEntries : [rawEntries];

  return (
    entries
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((entry: any) => ({
        appId,
        id: entry.id?.label || "",
        author: entry.author?.name?.label || "",
        title: entry.title?.label || "",
        body: String(entry.content?.label || ""),
        score: entry["im:rating"]?.label ? parseInt(entry["im:rating"].label, 10) : null,
        updatedAt: entry.updated?.label || "",
        deletedAt: null,
      }))
      // Filter out "invalid" reviews
      .filter((review: Review) => review.id && review.updatedAt)
  );
}

async function pollApp(app: App) {
  console.log(`Polling reviews for: ${app.name}`);

  const cutoffDate = Date.now() - REVIEW_WINDOW_MS;
  const allReviews: Review[] = [];
  let hadFailures = false;

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const response = await fetchWithRetry(rssUrl(app.id, page));
      const data = await response.json();
      const reviews = parseRssResponse(app.id, data);
      if (!reviews.length) {
        break;
      }
      allReviews.push(...reviews);
      const oldestReviewTimestamp = new Date(reviews[reviews.length - 1].updatedAt).getTime();
      if (oldestReviewTimestamp < cutoffDate) {
        break;
      }
    } catch (error) {
      console.error(`Page ${page} failed after retry for ${app.name}; skipping page:`, error);
      hadFailures = true;
      continue;
    }
  }

  upsertReviews(app.id, allReviews);
  // Only soft delete if all pages were fetched successfully
  if (!hadFailures) {
    softDeleteReviews(app.id, allReviews, cutoffDate);
  }
}

async function poll() {
  // Sequential instead of parallel to avoid potential rate limiting
  console.log("Started Polling");
  for (const app of apps) {
    await pollApp(app);
    // sleep for BETWEEN_APPS_DELAY_MS between each app
    await new Promise((resolve) => setTimeout(resolve, BETWEEN_APPS_DELAY_MS));
  }
  console.log("Polling completed");
}

export function startPolling() {
  // Run once immediately on start, then every POLL_INTERVAL_MS
  poll();
  setInterval(poll, POLL_INTERVAL_MS);
}
