"use client";

import { useEffect, useState } from "react";
import { usePartSearchStore } from "@/stores/partSearchStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ────────────────────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────────────────────
type IssueStatus = "未対応" | "調査中" | "対応済" | "再発監視";

interface Issue {
  不適合ID: number;
  部品ID: number;
  発生日: string | null;
  工程: string | null;
  優先度: string | null;
  状態: IssueStatus;
  内容: string | null;
  原因: string | null;
  再発防止: string | null;
  担当者: string | null;
  完了日: string | null;
  備考: string | null;
}

// ────────────────────────────────────────────────────────────────
// ステータス設定マップ
// ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; bg: string; border: string; text: string; badge: string }
> = {
  未対応: {
    label: "未対応",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-400",
    badge:
      "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/40 dark:text-red-400",
  },
  調査中: {
    label: "調査中",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
    badge:
      "bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/40 dark:text-amber-400",
  },
  対応済: {
    label: "対応済",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  再発監視: {
    label: "再発監視",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
    badge:
      "bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900/40 dark:text-blue-400",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { text: string; dot: string }
> = {
  高: { text: "text-red-600", dot: "bg-red-500" },
  中: { text: "text-amber-600", dot: "bg-amber-500" },
  低: { text: "text-slate-500", dot: "bg-slate-400" },
};

// ────────────────────────────────────────────────────────────────
// サマリーカード
// ────────────────────────────────────────────────────────────────
function SummaryCard({
  status,
  count,
}: {
  status: IssueStatus;
  count: number;
}) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-1 ${cfg.bg} ${cfg.border}`}
    >
      <div className={`text-[10px] font-bold uppercase tracking-wide ${cfg.text}`}>
        {cfg.label}
      </div>
      <div className={`text-2xl font-bold leading-none ${cfg.text}`}>
        {count}
      </div>
      <div className="text-[10px] text-muted-foreground">件</div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// 不具合カード
// ────────────────────────────────────────────────────────────────
function IssueCard({
  issue,
  onSelect,
  selected,
}: {
  issue: Issue;
  onSelect: (issue: Issue) => void;
  selected: boolean;
}) {
  const cfg = STATUS_CONFIG[issue.状態] ?? STATUS_CONFIG["未対応"];
  const priCfg = PRIORITY_CONFIG[issue.優先度 ?? "低"] ?? PRIORITY_CONFIG["低"];

  return (
    <button
      onClick={() => onSelect(issue)}
      className={`w-full text-left rounded-md border p-2.5 transition-all ${
        selected
          ? `${cfg.bg} ${cfg.border} ring-1 ring-offset-1 ring-current`
          : `bg-background border-border hover:${cfg.bg} hover:${cfg.border}`
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className="text-[11px] font-medium leading-tight line-clamp-2">
          {issue.内容 ?? "詳細不明"}
        </span>
        {issue.優先度 && (
          <span
            className={`shrink-0 flex items-center gap-0.5 text-[9px] font-bold ${priCfg.text}`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${priCfg.dot}`} />
            {issue.優先度}
          </span>
        )}
      </div>
      <div className="text-[10px] text-muted-foreground space-y-0.5">
        {issue.発生日 && <div>発生: {issue.発生日}</div>}
        {issue.工程 && <div>工程: {issue.工程}</div>}
        {issue.担当者 && <div>担当: {issue.担当者}</div>}
      </div>
    </button>
  );
}

// ────────────────────────────────────────────────────────────────
// 詳細パネル
// ────────────────────────────────────────────────────────────────
function IssueDetail({ issue }: { issue: Issue }) {
  const cfg = STATUS_CONFIG[issue.状態] ?? STATUS_CONFIG["未対応"];

  const fields: { label: string; value: string | null | undefined }[] = [
    { label: "不適合ID", value: String(issue.不適合ID) },
    { label: "発生日", value: issue.発生日 },
    { label: "工程", value: issue.工程 },
    { label: "優先度", value: issue.優先度 },
    { label: "担当者", value: issue.担当者 },
    { label: "完了日", value: issue.完了日 },
  ];

  return (
    <div
      className={`rounded-lg border p-4 h-full overflow-auto ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
        >
          {cfg.label}
        </span>
        <span className="text-xs font-semibold text-foreground">
          不適合 #{issue.不適合ID}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
        {fields.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[10px] font-bold text-muted-foreground">{label}</dt>
            <dd className="text-xs mt-0.5">{value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3">
        {issue.内容 && (
          <div>
            <div className="text-[10px] font-bold text-muted-foreground mb-1">
              内容
            </div>
            <div className="text-xs bg-background/60 rounded-md p-2.5 leading-relaxed border border-border/50">
              {issue.内容}
            </div>
          </div>
        )}
        {issue.原因 && (
          <div>
            <div className="text-[10px] font-bold text-muted-foreground mb-1">
              原因
            </div>
            <div className="text-xs bg-background/60 rounded-md p-2.5 leading-relaxed border border-border/50">
              {issue.原因}
            </div>
          </div>
        )}
        {issue.再発防止 && (
          <div>
            <div className="text-[10px] font-bold text-muted-foreground mb-1">
              再発防止策
            </div>
            <div className="text-xs bg-background/60 rounded-md p-2.5 leading-relaxed border border-border/50">
              {issue.再発防止}
            </div>
          </div>
        )}
        {issue.備考 && (
          <div>
            <div className="text-[10px] font-bold text-muted-foreground mb-1">
              備考
            </div>
            <div className="text-xs bg-background/60 rounded-md p-2.5 leading-relaxed border border-border/50">
              {issue.備考}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────────────────────────
export function QualityTab() {
  const { selectedPartId, tabLoadState } = usePartSearchStore();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState<IssueStatus | "全て">("全て");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041";

  useEffect(() => {
    if (!selectedPartId) return;
    setLoading(true);
    setError(null);
    setSelectedIssue(null);

    fetch(`${API_BASE}/api/parts/${selectedPartId}/issues`, {
      cache: "no-store",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data: Issue[]) => {
        setIssues(data);
        // 未対応が存在すれば最初にフォーカス
        const first = data.find((d) => d.状態 === "未対応") ?? data[0];
        if (first) setSelectedIssue(first);
      })
      .catch((e) => {
        // APIエンドポイントが未実装の場合はモックデータを使用
        console.warn("不具合API未実装 - モックデータで表示:", e.message);
        const mock: Issue[] = [
          {
            不適合ID: 1,
            部品ID: selectedPartId,
            発生日: "2026/02/14",
            工程: "マシニング",
            優先度: "高",
            状態: "未対応",
            内容: "バリ発生 — 外径φ12.5h7 仕上げ面に微細バリが確認された",
            原因: "工具摩耗による切削条件の変化",
            再発防止: "工具交換サイクルの短縮（200個→150個）",
            担当者: "田中",
            完了日: null,
            備考: null,
          },
          {
            不適合ID: 2,
            部品ID: selectedPartId,
            発生日: "2025/11/08",
            工程: "測定器室",
            優先度: "中",
            状態: "再発監視",
            内容: "寸法公差外れ — 穴径φ8H7 が上限超過",
            原因: "治具の熱膨張による位置ずれ",
            再発防止: "測定前の恒温管理時間を30分→60分に延長",
            担当者: "佐藤",
            完了日: "2025/11/20",
            備考: "3ロット連続正常確認済",
          },
          {
            不適合ID: 3,
            部品ID: selectedPartId,
            発生日: "2025/06/22",
            工程: "出荷検査",
            優先度: "高",
            状態: "対応済",
            内容: "表面粗さ不適合 Ra 1.6 → 実測 Ra 2.8",
            原因: "プログラムの切込み量設定ミス",
            再発防止: "CAMプログラムレビュー手順の追加",
            担当者: "山田",
            完了日: "2025/07/05",
            備考: null,
          },
        ];
        setIssues(mock);
        setSelectedIssue(mock[0]);
      })
      .finally(() => setLoading(false));
  }, [selectedPartId, API_BASE]);

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  const statuses: IssueStatus[] = ["未対応", "調査中", "対応済", "再発監視"];
  const counts = statuses.reduce(
    (acc, s) => {
      acc[s] = issues.filter((i) => i.状態 === s).length;
      return acc;
    },
    {} as Record<IssueStatus, number>
  );

  const filtered =
    filterStatus === "全て" ? issues : issues.filter((i) => i.状態 === filterStatus);

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-hidden">
      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-2 shrink-0">
        {statuses.map((s) => (
          <SummaryCard key={s} status={s} count={counts[s]} />
        ))}
      </div>

      {/* フィルターバー */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[10px] text-muted-foreground">絞込:</span>
        {(["全て", ...statuses] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-colors ${
              filterStatus === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {s}
            {s !== "全て" && (
              <span className="ml-1 text-[10px] opacity-70">
                ({counts[s as IssueStatus]})
              </span>
            )}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">
          合計 {issues.length} 件
        </span>
      </div>

      {/* カンバン + 詳細 */}
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.4fr] gap-3 overflow-hidden">
        {/* 左: 不具合一覧 */}
        <div className="overflow-auto space-y-1.5 pr-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">該当なし</p>
          ) : (
            filtered.map((issue) => (
              <IssueCard
                key={issue.不適合ID}
                issue={issue}
                onSelect={setSelectedIssue}
                selected={selectedIssue?.不適合ID === issue.不適合ID}
              />
            ))
          )}
        </div>

        {/* 右: 詳細パネル */}
        <div className="overflow-hidden">
          {selectedIssue ? (
            <IssueDetail issue={selectedIssue} />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground border border-dashed border-border rounded-lg">
              不具合を選択してください
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive shrink-0">{error}</p>
      )}
    </div>
  );
}