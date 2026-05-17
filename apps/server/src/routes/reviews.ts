import { Router, type Request, type Response } from "express";
import type { ReviewsResponse } from "@ios-reviews/types";
import { getReviews, getIsAppReady } from "../store";
import { apps } from "../config";

const router = Router();

router.get("/", (req: Request, res: Response<ReviewsResponse>) => {
  // Treat missing or empty appId as "no filter" (i.e. return reviews across all apps).
  const rawAppId = req.query.appId;
  const appId = typeof rawAppId === "string" && rawAppId.length > 0 ? rawAppId : undefined;
  const result = appId ? getReviews(appId) : getReviews();
  res.json({
    reviews: result,
    initializing: appId ? !getIsAppReady(appId) : apps.some((app) => !getIsAppReady(app.id)),
  });
});

export default router;
