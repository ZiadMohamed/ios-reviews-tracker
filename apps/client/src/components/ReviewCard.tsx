import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Review } from "@ios-reviews/types";
import { formatTimestamp, getScoreLevel, ScoreLevel } from "@/helper";

const SCORE_BADGE_CLASS: Record<ScoreLevel, string> = {
  [ScoreLevel.High]: "bg-green-100 text-green-700 border-0",
  [ScoreLevel.Medium]: "bg-yellow-100 text-yellow-700 border-0",
  [ScoreLevel.Low]: "bg-red-100 text-red-700 border-0",
};

export function ReviewCard({ review, appName }: { review: Review; appName?: string }) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="px-4 py-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-900">{review.author}</p>
            <p className="text-sm text-gray-400">
              {formatTimestamp(review.updatedAt)}
              {appName && <span className="text-gray-500"> · {appName}</span>}
            </p>
          </div>
          {review.score !== null && (
            <Badge className={cn("text-sm", SCORE_BADGE_CLASS[getScoreLevel(review.score)])}>
              ★ {review.score}
            </Badge>
          )}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">{review.body}</p>
      </CardContent>
    </Card>
  );
}
