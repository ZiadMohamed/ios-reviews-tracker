import { Router, type Request, type Response } from "express";
import type { Review } from "@ios-reviews/types";
import { getReviews } from "../store";

const router = Router();

router.get("/", (req: Request, res: Response<Review[]>) => {
  // Treat missing or empty appId as "no filter" (i.e. return reviews across all apps).
  const rawAppId = req.query.appId;
  const appId = typeof rawAppId === "string" && rawAppId.length > 0 ? rawAppId : undefined;
  const result = appId ? getReviews(appId) : getReviews();
  res.json(result);
});

export default router;
