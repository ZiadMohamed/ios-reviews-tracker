import { Router, type Request, type Response } from "express";
import type { App } from "@ios-reviews/types";
import { apps } from "../config";

const router = Router();

router.get("/", (_req: Request, res: Response<App[]>) => {
  res.json(apps);
});

export default router;
