import type { Review } from "@ios-reviews/types";
import { fetchJson } from "./http";

export interface GetReviewsParams {
  // string => specific app, null => all apps (no filter)
  appId: string | null;
}

export function getReviews(params: GetReviewsParams): Promise<Review[]> {
  const query = params.appId ? `?appId=${encodeURIComponent(params.appId)}` : "";
  return fetchJson<Review[]>(`/api/reviews${query}`);
}
