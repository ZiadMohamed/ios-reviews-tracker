import type { ReviewsResponse } from "@ios-reviews/types";
import { fetchJson } from "./http";

export interface GetReviewsParams {
  appId: string | null;
}

export function getReviews(params: GetReviewsParams): Promise<ReviewsResponse> {
  const query = params.appId ? `?appId=${encodeURIComponent(params.appId)}` : "";
  return fetchJson<ReviewsResponse>(`/api/reviews${query}`);
}
