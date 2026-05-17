import { useEffect } from "react";
import type { App as IOSApp, Review } from "@ios-reviews/types";

export default function App() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const appsRes = await fetch("/api/apps");
        const apps: IOSApp[] = await appsRes.json();
        if (cancelled) return;
        console.log("[client] /api/apps →", apps);

        const firstAppId = apps[0]?.id;
        const reviewsRes = await fetch(
          firstAppId ? `/api/reviews?appId=${encodeURIComponent(firstAppId)}` : "/api/reviews",
        );
        const reviews: Review[] = await reviewsRes.json();
        if (cancelled) return;
        console.log("[client] /api/reviews →", reviews);
      } catch (err) {
        if (!cancelled) console.error("[client] fetch failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return <div data-testid="root" />;
}
