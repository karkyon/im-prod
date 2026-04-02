import express from "express";
import cors from "cors";
import partsRouter from "./routes/parts.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3041);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "im-prod-api", port: PORT });
});

app.use("/api/parts", partsRouter);

app.listen(PORT, () => {
  console.log(`✅ im-prod API server running on http://localhost:${PORT}`);
});
