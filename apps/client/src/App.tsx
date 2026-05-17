import { useEffect, useMemo, useState } from "react";
import { useApps } from "@/hooks/useApps";
import { useReviews } from "@/hooks/useReviews";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Skeleton } from "./components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/ui/pagination";
import { ReviewCard } from "./components/ReviewCard";
import { ReviewCardSkeleton } from "./components/ReviewCardSkeleton";

const ALL_APPS_VALUE = "__all__";
const REVIEWS_PER_PAGE = 5;

type SortBy = "recent" | "rating";

export default function App() {
  const { data: apps, isFetching: isFetchingApps } = useApps();
  const [selectedAppId, setSelectedAppId] = useState<string | null | undefined>(undefined);
  const { data: { reviews = [], initializing = true } = {}, isFetching: isFetchingReviews } =
    useReviews(selectedAppId);
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [page, setPage] = useState(1);
  const isLoading = isFetchingApps || isFetchingReviews || initializing;

  useEffect(() => {
    if (apps && apps.length > 0) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps]);

  // Reset to page 1 whenever the filter or sort changes
  useEffect(() => {
    setPage(1);
  }, [selectedAppId, sortBy]);

  const sortedReviews = useMemo(() => {
    if (!reviews) return [];
    const sortedReviews = reviews.slice();
    if (sortBy === "recent") {
      sortedReviews.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } else {
      // sort by rating desc, defensive code to pull null last
      sortedReviews.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
    }
    return sortedReviews;
  }, [reviews, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedReviews.length / REVIEWS_PER_PAGE));
  const pagedReviews = useMemo(() => {
    const start = (page - 1) * REVIEWS_PER_PAGE;
    return sortedReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [sortedReviews, page]);

  const appNameById = useMemo(() => new Map((apps || []).map((app) => [app.id, app.name])), [apps]);
  const showAppName = selectedAppId === null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">App Store Reviews</h1>
            <p className="text-gray-500 mt-1">Showing reviews from the last 48 hours</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
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
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => <ReviewCardSkeleton key={i} />)
          ) : !pagedReviews.length ? (
            <p className="text-gray-400 text-sm">No reviews in the last 48 hours.</p>
          ) : (
            pagedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                appName={showAppName ? appNameById.get(review.appId) : undefined}
              />
            ))
          )}
        </div>

        {!isLoading && totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={cn("cursor-pointer", page === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    isActive={p === page}
                    onClick={() => setPage(p)}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={cn(
                    "cursor-pointer",
                    page === totalPages && "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
