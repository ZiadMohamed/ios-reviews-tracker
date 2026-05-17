import "dotenv/config";
import express from "express";
import cors from "cors";

import appsRouter from "./routes/apps";
import reviewsRouter from "./routes/reviews";

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.use("/api/apps", appsRouter);
app.use("/api/reviews", reviewsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port} (CORS: ${clientOrigin})`);
});
