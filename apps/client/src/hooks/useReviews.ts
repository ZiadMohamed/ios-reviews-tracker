import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/services/reviews";
import { queryKeys } from "./queryKeys";

// appId: undefined -> not yet known
// appId: null     -> "all apps" (no filter)
// appId: string   -> specific app id
// Only enable the query for string or null cases
export function useReviews(appId: string | null | undefined) {
  const enabled = appId !== undefined;
  const resolvedAppId = appId ?? null;
  return useQuery({
    queryKey: queryKeys.reviews(resolvedAppId),
    queryFn: () => getReviews({ appId: resolvedAppId }),
    enabled,
  });
}
