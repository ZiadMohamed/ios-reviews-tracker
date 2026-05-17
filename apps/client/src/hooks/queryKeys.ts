export const queryKeys = {
  apps: () => ["apps"] as const,
  reviews: (appId: string | null) => ["reviews", { appId }] as const,
};
