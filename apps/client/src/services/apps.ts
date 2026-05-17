import type { App } from "@ios-reviews/types";
import { fetchJson } from "./http";

export function getApps(): Promise<App[]> {
  return fetchJson<App[]>("/api/apps");
}
