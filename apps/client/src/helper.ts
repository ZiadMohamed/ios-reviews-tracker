const TIMESTAMP_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatTimestamp(iso: string): string {
  return TIMESTAMP_FORMATTER.format(new Date(iso));
}

export enum ScoreLevel {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 4) return ScoreLevel.High;
  if (score === 3) return ScoreLevel.Medium;
  return ScoreLevel.Low;
}
