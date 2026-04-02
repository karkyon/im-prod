"use client";

import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { usePartSearchStore } from "@/stores/partSearchStore";
import { PartsSearchTable } from "@/components/tables/PartsSearchTable";

export function SearchSidebar() {
  const {
    sidebarOpen,
    conditions,
    results,
    total,
    loading,
    searchError,
    selectedPartId,
    setConditions,
    clearConditions,
    executeSearch,
    selectPart,
  } = usePartSearchStore();

  const [showMore, setShowMore] = useState(false);

  if (!sidebarOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeSearch(1);
    }
  };

  return (
    <aside className="w-72 shrink-0 flex flex-col border-r border-border bg-background overflow-hidden">
      {/* 検索フォーム */}
      <form
        onSubmit={handleSearch}
        className="p-3 border-b border-border space-y-2 shrink-0"
      >
        {/* キーワード */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="部品ID / 図面番号 / 名称"
            value={conditions.keyword ?? ""}
            onChange={(e) => setConditions({ keyword: e.target.value })}
            onKeyDown={handleKeyDown}
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* 詳細条件トグル */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {showMore ? (
            <ChevronUp size={11} />
          ) : (
            <ChevronDown size={11} />
          )}
          詳細条件
        </button>

        {showMore && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="得意先名"
              value={conditions.customer ?? ""}
              onChange={(e) =>
                setConditions({ customer: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <input
              type="text"
              placeholder="主機種型式"
              value={conditions.machineType ?? ""}
              onChange={(e) =>
                setConditions({ machineType: e.target.value })
              }
              className="w-full px-2 py-1.5 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {/* フラグ */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {(
                [
                  { key: "isOld", label: "旧型" },
                  { key: "isSpecial", label: "特別品" },
                  { key: "isDiscontinued", label: "廃止品" },
                  { key: "hasAlert", label: "在庫注意" },
                ] as const
              ).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-1.5 text-[11px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      !!(conditions as Record<string, unknown>)[key]
                    }
                    onChange={(e) =>
                      setConditions({
                        [key]: e.target.checked || undefined,
                      })
                    }
                    className="w-3 h-3 rounded"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ボタン群 */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-1.5 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "検索中…" : "検索"}
          </button>
          <button
            type="button"
            onClick={clearConditions}
            className="px-2.5 py-1.5 text-xs border border-input rounded-md hover:bg-muted transition-colors"
            title="条件クリア"
          >
            <X size={13} />
          </button>
        </div>

        {searchError && (
          <p className="text-[11px] text-destructive">{searchError}</p>
        )}
      </form>

      {/* 検索結果テーブル（TanStack Table） */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <PartsSearchTable
          data={results}
          total={total}
          selectedPartId={selectedPartId}
          onSelectPart={selectPart}
          loading={loading}
          pageSize={50}
        />
      </div>
    </aside>
  );
}
