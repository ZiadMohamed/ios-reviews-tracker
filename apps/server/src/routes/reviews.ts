import { Router, type Request, type Response } from "express";
import type { Review } from "@ios-reviews/types";
import { reviews } from "../data/reviews";

const router = Router();

router.get("/", (req: Request, res: Response<Review[]>) => {
  const appId = typeof req.query.appId === "string" ? req.query.appId : undefined;
  const result = appId ? reviews.filter((r) => r.appId === appId) : reviews;
  res.json(result);
});

export default router;
