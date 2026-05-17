import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function ReviewCardSkeleton() {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="px-4 py-1">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
}
