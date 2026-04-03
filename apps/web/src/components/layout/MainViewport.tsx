"use client";

// ================================================================
// MainViewport
// ①-B 識別バー: 図面番号のみ表示
// ①-C 原価ID / 共通部品ID / 不適合ID を追加
// ②-A 図面番号・名称をグリッドに追加
// ②-B 作成日 + 旧型/特別品/廃止品バッジを目立つ配色で
// ②-C 材質・材料サイズを削除
// ③   サマリータブ廃止 (basic をデフォルトに)
// ================================================================

import { usePartSearchStore } from "@/stores/partSearchStore";
import { PART_TABS } from "@/types/parts";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { BasicInfoTab } from "@/components/part/tabs/BasicInfoTab";
import { MaterialsTab } from "@/components/part/tabs/MaterialsTab";
import { ProcessesTab } from "@/components/part/tabs/ProcessesTab";
import { QualityTab } from "@/components/part/tabs/QualityTab";
import {
  ProductionHistoryTab,
  OrdersTab,
  InventoryTab,
  PickingHistoryTab,
  CancellationsTab,
  PriceHistoryTab,
  WipTab,
  DiagramsTab,
} from "@/components/part/tabs/HistoryTabs";
import {
  exportOrdersCsv,
  exportInventoryCsv,
  exportProductionCsv,
  exportPriceHistoryCsv,
  exportCancellationsCsv,
  exportPickingCsv,
} from "@/services/csvExport";

// ── フィールドコンポーネント ─────────────────────────────────────
function Field({
  label,
  value,
  unit,
  highlight,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  const display = value != null && value !== "" ? String(value) : "—";
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div
        className={`font-medium truncate text-xs ${
          highlight ? "text-amber-600 font-bold" : "text-foreground"
        } ${mono ? "font-mono" : ""}`}
      >
        {display}
        {unit && value != null && value !== "" ? (
          <span className="ml-0.5 font-normal text-muted-foreground text-[10px]">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function RemarkField({
  label,
  items,
  urgent,
}: {
  label: string;
  items: { id: number; no: number; text: string }[];
  urgent?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <span
        className={`text-[10px] font-bold ${
          urgent ? "text-amber-600" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <div className="text-xs text-foreground whitespace-pre-wrap line-clamp-2">
        {items.map((i) => i.text).join("\n")}
      </div>
    </div>
  );
}

// ── 固定カルテパネル ─────────────────────────────────────────────
function PartKartePanel() {
  const { selectedBasic: b, selectedRemarks: r, detailLoading } =
    usePartSearchStore();

  if (detailLoading) {
    return (
      <div className="p-3 space-y-2 border-b border-border shrink-0">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    );
  }

  if (!b) {
    return (
      <div className="flex items-center justify-center h-14 text-xs text-muted-foreground border-b border-border shrink-0">
        左の検索から部品を選択してください
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-background shrink-0">

      {/* ①-B: 識別バー — 図面番号のみ */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/30 border-b border-border">
        <span className="font-mono font-bold text-sm text-foreground">
          {b.図面番号 ?? "—"}
        </span>
        {/* ②-B: 区分バッジ（目立つ配色） */}
        {b.旧型区分 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-400">
            旧型
          </span>
        )}
        {b.特別品区分 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-400">
            特別品
          </span>
        )}
        {b.廃止部品区分 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/40 dark:text-red-400">
            廃止品
          </span>
        )}
        {b.現在在庫数 === 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-950/40 dark:text-orange-400">
            在庫0
          </span>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          更新: {b.更新日付 ?? "—"}
          {b.更新者 ? ` (${b.更新者})` : ""}
        </span>
      </div>

      {/* ②-A ②-C ①-C: 基本情報グリッド */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-x-3 gap-y-1.5 px-3 py-2 text-xs">
        {/* ②-A: 図面番号・名称をグリッドに追加 */}
        <Field label="部品ID"     value={b.部品ID}      mono />
        <Field label="図面番号"   value={b.図面番号}    mono />
        <Field label="名称"       value={b.名称} />
        <Field label="得意先"     value={b.得意先名} />
        <Field label="主機種型式" value={b.主機種型式} />
        <Field
          label={`現在在庫${b.現在在庫数 === 0 ? " ⚠" : ""}`}
          value={b.現在在庫数}
          unit="個"
          highlight={b.現在在庫数 === 0}
        />
        {/* ②-B: 作成日 */}
        <Field label="作成日" value={b.作成日} />
        {/* 部品重量: 0 の場合は — 表示 */}
        <Field
          label="部品重量"
          value={b.部品重量 != null && b.部品重量 > 0 ? `${b.部品重量} kg` : null}
        />
        {/* ①-C: 原価ID / 共通部品ID / 不適合ID */}
        <Field label="原価ID"     value={b.原価ID}     mono />
        <Field label="共通部品ID" value={b.共通部品ID} mono />
        <Field label="不適合ID"   value={b.不適合ID}   mono />
        {/* ②-C: 材質・材料サイズは削除 */}
      </div>

      {/* 備考（あれば表示） */}
      {r && (r.workProgress.length > 0 || r.dispatch.length > 0) && (
        <div className="grid grid-cols-2 gap-x-3 px-3 pb-2 text-xs">
          <RemarkField label="工程用備考" items={r.workProgress} />
          <RemarkField label="手配時周知" items={r.dispatch} urgent />
        </div>
      )}
    </div>
  );
}

// ── サブタブ + CSV出力ボタン ─────────────────────────────────────
function SubTabs() {
  const {
    activeTab,
    setActiveTab,
    selectedPartId,
    tabLoadState,
    selectedOrders,
    selectedInventoryMovements,
    selectedProductionHistory,
    selectedPriceHistory,
    selectedCancellations,
    selectedPickingHistory,
  } = usePartSearchStore();

  if (!selectedPartId) return null;

  const csvHandlers: Partial<Record<string, () => void>> = {
    orders: () =>
      selectedOrders && exportOrdersCsv(selectedOrders, selectedPartId),
    inventory: () =>
      selectedInventoryMovements &&
      exportInventoryCsv(selectedInventoryMovements, selectedPartId),
    production: () =>
      selectedProductionHistory &&
      exportProductionCsv(selectedProductionHistory, selectedPartId),
    priceHistory: () =>
      selectedPriceHistory &&
      exportPriceHistoryCsv(selectedPriceHistory, selectedPartId),
    cancellations: () =>
      selectedCancellations &&
      exportCancellationsCsv(selectedCancellations, selectedPartId),
    picking: () =>
      selectedPickingHistory &&
      exportPickingCsv(selectedPickingHistory, selectedPartId),
  };

  const currentCsvHandler = csvHandlers[activeTab];

  return (
    <div className="flex items-center border-b border-border shrink-0 bg-background">
      {/* タブ一覧（横スクロール） */}
      <div className="flex overflow-x-auto flex-1 min-w-0 scroll-thin">
        {/* ③ PART_TABS から summary が削除されているため自動的に非表示 */}
        {PART_TABS.map((tab) => {
          const isLoading = tabLoadState[tab.id]?.loading;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2 text-[11px] whitespace-nowrap border-r border-border/50 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "bg-background font-semibold border-b-2 border-b-primary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {isLoading && (
                <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* CSV出力ボタン（対応タブのみ表示） */}
      {currentCsvHandler && (
        <button
          onClick={currentCsvHandler}
          className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] border-l border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="現在のタブをCSV出力"
        >
          <Download size={12} />
          <span className="hidden xl:inline">CSV</span>
        </button>
      )}
    </div>
  );
}

// ── タブコンテンツ ──────────────────────────────────────────────
function TabContent() {
  const { activeTab, selectedPartId, detailLoading } = usePartSearchStore();

  if (!selectedPartId) return null;

  if (detailLoading && activeTab === "basic") {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  // ③ case "summary" を削除。デフォルトは "basic"
  switch (activeTab) {
    case "basic":         return <BasicInfoTab />;
    case "materials":     return <MaterialsTab />;
    case "processes":     return <ProcessesTab />;
    case "production":    return <ProductionHistoryTab />;
    case "orders":        return <OrdersTab />;
    case "inventory":     return <InventoryTab />;
    case "picking":       return <PickingHistoryTab />;
    case "cancellations": return <CancellationsTab />;
    case "priceHistory":  return <PriceHistoryTab />;
    case "wip":           return <WipTab />;
    case "diagrams":      return <DiagramsTab />;
    case "quality":       return <QualityTab />;
    default:              return null;
  }
}

// ── メインビューポート ────────────────────────────────────────────
export function MainViewport() {
  const { selectedPartId } = usePartSearchStore();

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <PartKartePanel />
      <SubTabs />
      <div className="flex-1 overflow-hidden min-h-0">
        {selectedPartId ? (
          <TabContent />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            部品を選択してください
          </div>
        )}
      </div>
    </main>
  );
}