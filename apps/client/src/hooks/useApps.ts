import { useQuery } from "@tanstack/react-query";
import { getApps } from "@/services/apps";
import { queryKeys } from "./queryKeys";

export function useApps() {
  return useQuery({
    queryKey: queryKeys.apps(),
    queryFn: () => getApps(),
    refetchOnWindowFocus: false,
  });
}
