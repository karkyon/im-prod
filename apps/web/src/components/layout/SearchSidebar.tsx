"use client";

import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { usePartSearchStore } from "@/stores/partSearchStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PartListRow } from "@/types/parts";

function StatusBadge({ status }: { status: PartListRow["status"] }) {
  if (status === "不適合あり")
    return <Badge variant="destructive" className="text-[10px] py-0 px-1">不適合</Badge>;
  if (status === "在庫注意")
    return <Badge variant="outline" className="text-[10px] py-0 px-1 text-amber-600 border-amber-400">在庫注意</Badge>;
  return null;
}

export function SearchSidebar() {
  const {
    sidebarOpen, conditions, results, total,
    loading, searchError,
    selectedPartId,
    setConditions, clearConditions, executeSearch, selectPart,
  } = usePartSearchStore();

  const [showMore, setShowMore] = useState(false);

  if (!sidebarOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(1);
  };

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-background overflow-hidden">
      {/* 検索フォーム */}
      <form onSubmit={handleSearch} className="p-3 border-b border-border space-y-2">
        {/* キーワード */}
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="部品ID / 図面番号 / 名称"
            value={conditions.keyword ?? ""}
            onChange={(e) => setConditions({ keyword: e.target.value })}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* 詳細条件トグル */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          {showMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          詳細条件
        </button>

        {showMore && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="得意先名"
              value={conditions.customer ?? ""}
              onChange={(e) => setConditions({ customer: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              type="text"
              placeholder="主機種型式"
              value={conditions.machineType ?? ""}
              onChange={(e) => setConditions({ machineType: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-input rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {/* フラグ */}
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  { key: "isOld",          label: "旧型" },
                  { key: "isSpecial",      label: "特別品" },
                  { key: "isDiscontinued", label: "廃止品" },
                  { key: "hasAlert",       label: "在庫注意" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-1 text-[11px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!(conditions as Record<string, unknown>)[key]}
                    onChange={(e) => setConditions({ [key]: e.target.checked || undefined })}
                    className="w-3 h-3"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "検索中…" : "検索"}
          </button>
          <button
            type="button"
            onClick={() => clearConditions()}
            className="p-1.5 text-xs border border-input rounded hover:bg-muted transition-colors"
            title="クリア"
          >
            <X size={14} />
          </button>
        </div>

        {searchError && (
          <p className="text-[11px] text-destructive">{searchError}</p>
        )}
      </form>

      {/* 件数 */}
      {results.length > 0 && (
        <div className="px-3 py-1.5 text-[11px] text-muted-foreground border-b border-border">
          {total.toLocaleString()} 件
        </div>
      )}

      {/* 検索結果一覧 */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-3 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            検索条件を入力して検索してください
          </div>
        )}

        {!loading && results.map((row) => (
          <button
            key={row.partId}
            onClick={() => selectPart(row.partId)}
            className={`w-full text-left px-3 py-2 border-b border-border hover:bg-muted transition-colors ${
              selectedPartId === row.partId ? "bg-accent" : ""
            }`}
          >
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-mono text-xs font-bold text-foreground">
                {row.partId}
              </span>
              <StatusBadge status={row.status} />
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {row.drawingNo ?? "—"}
            </div>
            <div className="text-[11px] text-foreground truncate">
              {row.partName ?? "—"}
            </div>
            <div className="flex gap-2 mt-0.5 text-[10px] text-muted-foreground">
              <span>在庫: {row.stockQty}</span>
              {row.pendingToday > 0 && <span>注残: {row.pendingToday}</span>}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
