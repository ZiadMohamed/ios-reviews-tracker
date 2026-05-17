import { useQuery } from "@tanstack/react-query";
import { getReviews } from "@/services/reviews";
import { queryKeys } from "./queryKeys";

// appId: undefined -> not yet known
// appId: null     -> "all apps" (no filter)
// appId: string   -> specific app id
// Only enable the query for string or null cases
export function useReviews(appId: string | null | undefined) {
  const enabled = (typeof appId === "string" && appId?.trim().length > 0) || appId === null;
  const resolvedAppId = appId ?? null;
  return useQuery({
    queryKey: queryKeys.reviews(resolvedAppId),
    queryFn: () => getReviews({ appId: resolvedAppId }),
    enabled,
    refetchInterval: (query) => {
      // Keep polling every 3 seconds until first poll completes
      if (query.state.data?.initializing) return 3000;
      return false;
    },
  });
}
