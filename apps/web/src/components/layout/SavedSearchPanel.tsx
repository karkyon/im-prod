"use client";

// ================================================================
// F-02 検索条件保存パネル
// apps/web/src/components/layout/SavedSearchPanel.tsx
// ================================================================

import { useEffect, useState } from "react";
import { Star, Trash2, Check, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useSavedSearchStore } from "@/stores/savedSearchStore";
import { usePartSearchStore } from "@/stores/partSearchStore";
import type { PartSearchParams } from "@/types/parts";

interface SavedSearchPanelProps {
  /** 現在の検索条件（保存時に使用） */
  currentConditions: PartSearchParams;
}

export function SavedSearchPanel({ currentConditions }: SavedSearchPanelProps) {
  const {
    savedSearches,
    loadFromStorage,
    saveSearch,
    deleteSearch,
    setDefault,
    clearDefault,
  } = useSavedSearchStore();
  const { setConditions, executeSearch } = usePartSearchStore();

  const [open, setOpen] = useState(false);
  const [savingName, setSavingName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // マウント時に LocalStorage から読み込む
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // 保存条件を適用して検索実行
  const applySearch = (conditions: PartSearchParams) => {
    setConditions(conditions);
    setOpen(false);
    executeSearch(1);
  };

  // 保存処理
  const handleSave = () => {
    if (!savingName.trim()) return;
    saveSearch(savingName, currentConditions);
    setSavingName("");
    setShowSaveInput(false);
  };

  const hasSearches = savedSearches.length > 0;

  return (
    <div className="border-b border-border">
      {/* トグルバー */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Star size={11} className="text-amber-500 shrink-0" />
        <span className="flex-1 text-left font-medium">
          保存条件
          {hasSearches && (
            <span className="ml-1.5 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0">
              {savedSearches.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* 保存入力欄トグル */}
          {showSaveInput ? (
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="条件名を入力"
                value={savingName}
                onChange={(e) => setSavingName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
                className="flex-1 px-2 py-1 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                onClick={handleSave}
                disabled={!savingName.trim()}
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowSaveInput(false);
                  setSavingName("");
                }}
                className="px-2 py-1 text-xs border border-input rounded-md hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveInput(true)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] border border-dashed border-border text-muted-foreground hover:bg-muted/50 rounded-md transition-colors"
            >
              <Plus size={11} />
              現在の条件を保存
            </button>
          )}

          {/* 保存済み一覧 */}
          {hasSearches ? (
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {savedSearches.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs group cursor-pointer transition-colors ${
                    s.isDefault
                      ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/20"
                      : "hover:bg-muted/60 border border-transparent"
                  }`}
                  onClick={() => applySearch(s.conditions)}
                >
                  {/* デフォルトスター */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      s.isDefault ? clearDefault() : setDefault(s.id);
                    }}
                    className="shrink-0"
                    title={s.isDefault ? "デフォルト解除" : "デフォルトに設定"}
                  >
                    <Star
                      size={11}
                      className={
                        s.isDefault
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground/40 hover:text-amber-400"
                      }
                    />
                  </button>

                  {/* 条件名 */}
                  <span className="flex-1 truncate text-foreground font-medium">
                    {s.name}
                  </span>

                  {/* サマリー */}
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {conditionSummary(s.conditions)}
                  </span>

                  {/* 削除 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSearch(s.id);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="削除"
                  >
                    <Trash2 size={11} className="text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground text-center py-1">
              保存済みの条件はありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** 検索条件の短縮サマリー文字列 */
function conditionSummary(c: PartSearchParams): string {
  const parts: string[] = [];
  if (c.keyword) parts.push(c.keyword.slice(0, 10));
  if (c.customer) parts.push(c.customer.slice(0, 8));
  if (c.isOld) parts.push("旧型");
  if (c.isSpecial) parts.push("特別");
  if (c.hasAlert) parts.push("在庫注意");
  return parts.length > 0 ? parts.join(", ").slice(0, 20) : "全件";
}