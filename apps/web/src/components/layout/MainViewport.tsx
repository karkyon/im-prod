"use client";

import { usePartSearchStore } from "@/stores/partSearchStore";
import { PART_TABS } from "@/types/parts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ── 固定カルテパネル ─────────────────────────────────────────────
function PartKartePanel() {
  const { selectedBasic, selectedRemarks, detailLoading } = usePartSearchStore();

  if (detailLoading) {
    return (
      <div className="p-4 space-y-2 border-b border-border">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!selectedBasic) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-b border-border">
        左の検索から部品を選択してください
      </div>
    );
  }

  const b = selectedBasic;

  return (
    <div className="border-b border-border bg-background shrink-0">
      {/* 識別バー */}
      <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-b border-border">
        <span className="font-mono font-bold text-sm">#{b.部品ID}</span>
        <span className="text-xs text-muted-foreground">{b.図面番号 ?? "—"}</span>
        <span className="text-sm font-medium truncate max-w-64">{b.名称 ?? "—"}</span>
        {b.旧型区分 && <Badge variant="secondary" className="text-[10px]">旧型</Badge>}
        {b.特別品区分 && <Badge variant="secondary" className="text-[10px]">特別品</Badge>}
        {b.廃止部品区分 && <Badge variant="destructive" className="text-[10px]">廃止</Badge>}
        <span className="ml-auto text-[11px] text-muted-foreground">
          更新: {b.更新日付 ?? "—"} {b.更新者 ? `(${b.更新者})` : ""}
        </span>
      </div>

      {/* 基本情報グリッド */}
      <div className="grid grid-cols-4 gap-x-4 gap-y-1 px-4 py-2 text-xs">
        <Field label="得意先" value={b.得意先名} />
        <Field label="主機種型式" value={b.主機種型式} />
        <Field label="現在在庫" value={b.現在在庫数} highlight={b.現在在庫数 === 0} />
        <Field label="部品重量" value={b.部品重量 != null ? `${b.部品重量} kg` : null} />
        <Field label="材質" value={b.材質} />
        <Field label="材料名称" value={b.材料名称} />
        <Field label="材料型式" value={b.材料型式} />
        <Field label="作成日" value={b.作成日} />
      </div>

      {/* 備考エリア */}
      {selectedRemarks && (
        <div className="grid grid-cols-2 gap-x-4 px-4 pb-2 text-xs">
          <RemarkField
            label="工程用備考"
            items={selectedRemarks.workProgress}
          />
          <RemarkField
            label="手配時周知"
            items={selectedRemarks.dispatch}
          />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div
        className={`font-medium truncate ${
          highlight ? "text-amber-600 font-bold" : "text-foreground"
        }`}
      >
        {value != null && value !== "" ? String(value) : "—"}
      </div>
    </div>
  );
}

function RemarkField({
  label,
  items,
}: {
  label: string;
  items: { id: number; no: number; text: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="text-foreground whitespace-pre-wrap line-clamp-2">
        {items.map((i) => i.text).join("\n")}
      </div>
    </div>
  );
}

// ── サブタブ ─────────────────────────────────────────────────────
function SubTabs() {
  const { activeTab, setActiveTab, selectedPartId } = usePartSearchStore();

  if (!selectedPartId) return null;

  return (
    <div className="flex border-b border-border overflow-x-auto shrink-0 bg-background">
      {PART_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-2 text-xs whitespace-nowrap border-r border-border transition-colors ${
            activeTab === tab.id
              ? "bg-background font-semibold border-b-2 border-b-primary text-primary"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── タブコンテンツ（暫定表示）───────────────────────────────────
function TabContent() {
  const { activeTab, selectedPartId, detailLoading } = usePartSearchStore();

  if (!selectedPartId) return null;
  if (detailLoading) {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  const tab = PART_TABS.find((t) => t.id === activeTab);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="text-sm text-muted-foreground">
        📋 [{tab?.label}] タブ — 実装中
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        部品ID: {selectedPartId} のデータを API から取得して表示予定
      </div>
    </div>
  );
}

// ── メインビューポート ────────────────────────────────────────────
export function MainViewport() {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <PartKartePanel />
      <SubTabs />
      <TabContent />
    </main>
  );
}
