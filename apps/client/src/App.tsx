import { useEffect, useState } from "react";
import { useApps } from "@/hooks/useApps";
import { useReviews } from "@/hooks/useReviews";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Skeleton } from "./components/ui/skeleton";
import { ReviewCard } from "./components/ReviewCard";
import { ReviewCardSkeleton } from "./components/ReviewCardSkeleton";

const ALL_APPS_VALUE = "__all__";

export default function App() {
  const { data: apps, isFetching: isFetchingApps } = useApps();
  const [selectedAppId, setSelectedAppId] = useState<string | null | undefined>(undefined);
  const { data: reviews, isFetching: isFetchingReviews } = useReviews(selectedAppId);

  useEffect(() => {
    if (apps && apps.length > 0) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">App Store Reviews</h1>
            <p className="text-gray-500 mt-1">Showing reviews from the last 48 hours</p>
          </div>
          {isFetchingApps ? (
            <Skeleton className="h-9 w-44" />
          ) : (
            <Select
              value={selectedAppId === null ? ALL_APPS_VALUE : selectedAppId}
              onValueChange={(value) => setSelectedAppId(value === ALL_APPS_VALUE ? null : value)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select an app" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_APPS_VALUE}>All apps</SelectItem>
                {(apps || []).map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {isFetchingApps || isFetchingReviews ? (
            [1, 2, 3].map((i) => <ReviewCardSkeleton key={i} />)
          ) : !reviews?.length ? (
            <p className="text-gray-400 text-sm">No reviews in the last 48 hours.</p>
          ) : (
            reviews.map((review) => <ReviewCard key={review.id} review={review} />)
          )}
        </div>
      </div>
    </div>
  );
}
