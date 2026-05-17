import { useApps } from "@/hooks/useApps";
import { useReviews } from "@/hooks/useReviews";

export default function App() {
  const appsQuery = useApps();
  const firstAppId = appsQuery.data?.[0]?.id;
  const reviewsQuery = useReviews(firstAppId);

  console.log("[client] /api/apps →", appsQuery.data);
  console.log("[client] /api/reviews →", reviewsQuery.data);

  return <div data-testid="root" />;
}
