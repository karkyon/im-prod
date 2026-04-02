import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT ?? 3041);

app.use(cors());
app.use(express.json());

// ヘルスチェック
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "im-prod-api", port: PORT });
});

// 部品情報API プレースホルダ
app.get("/api/parts/search", (_req, res) => {
  res.json({ rows: [], total: 0, message: "API stub - 実装予定" });
});

app.listen(PORT, () => {
  console.log(`✅ im-prod API server running on http://localhost:${PORT}`);
});
