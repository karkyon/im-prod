"use client";

// ================================================================
// MainViewport - QualityTab追加 + CSV出力ボタン付きタブバー
// apps/web/src/components/layout/MainViewport.tsx
// ================================================================

import { usePartSearchStore } from "@/stores/partSearchStore";
import { PART_TABS } from "@/types/parts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { SummaryTab } from "@/components/part/tabs/SummaryTab";
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

// ── 固定カルテパネル ─────────────────────────────────────────────
function PartKartePanel() {
  const { selectedBasic, selectedRemarks, detailLoading } =
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

  if (!selectedBasic) {
    return (
      <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border-b border-border shrink-0">
        左の検索から部品を選択してください
      </div>
    );
  }

  const b = selectedBasic;

  return (
    <div className="border-b border-border bg-background shrink-0">
      {/* 識別バー */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border-b border-border">
        <span className="font-mono font-bold text-sm">#{b.部品ID}</span>
        <span className="text-[11px] text-muted-foreground font-mono">
          {b.図面番号 ?? "—"}
        </span>
        <span className="text-xs font-medium truncate max-w-48 xl:max-w-72">
          {b.名称 ?? "—"}
        </span>
        {b.旧型区分 && (
          <Badge variant="secondary" className="text-[9px] h-4 px-1">旧型</Badge>
        )}
        {b.特別品区分 && (
          <Badge variant="secondary" className="text-[9px] h-4 px-1">特別</Badge>
        )}
        {b.廃止部品区分 && (
          <Badge variant="destructive" className="text-[9px] h-4 px-1">廃止</Badge>
        )}
        {b.現在在庫数 === 0 && (
          <Badge
            variant="outline"
            className="text-[9px] h-4 px-1 text-amber-600 border-amber-400"
          >
            在庫0
          </Badge>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
          更新: {b.更新日付 ?? "—"}
          {b.更新者 ? ` (${b.更新者})` : ""}
        </span>
      </div>

      {/* 基本情報グリッド */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-x-3 gap-y-1 px-3 py-2 text-xs">
        <Field label="得意先" value={b.得意先名} />
        <Field label="主機種型式" value={b.主機種型式} />
        <Field
          label="現在在庫"
          value={b.現在在庫数}
          unit="個"
          highlight={b.現在在庫数 === 0}
        />
        {/* 部品重量: 0 の場合は「—」表示に統一 */}
        <Field
          label="部品重量"
          value={
            b.部品重量 != null && b.部品重量 > 0
              ? `${b.部品重量} kg`
              : null
          }
        />
        <Field label="材質" value={b.材質} />
        <Field label="材料サイズ" value={b.材料サイズ} />
      </div>

      {/* 備考（あれば表示） */}
      {selectedRemarks &&
        (selectedRemarks.workProgress.length > 0 ||
          selectedRemarks.dispatch.length > 0) && (
          <div className="grid grid-cols-2 gap-x-3 px-3 pb-2 text-xs">
            <RemarkField
              label="工程用備考"
              items={selectedRemarks.workProgress}
            />
            <RemarkField
              label="手配時周知"
              items={selectedRemarks.dispatch}
              urgent
            />
          </div>
        )}
    </div>
  );
}

function Field({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  highlight?: boolean;
}) {
  const display = value != null && value !== "" ? String(value) : "—";
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div
        className={`font-medium truncate text-xs ${
          highlight ? "text-amber-600 font-bold" : "text-foreground"
        }`}
      >
        {display}
        {unit && value != null ? (
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

  // CSV出力できるタブとそのデータのマッピング
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

  if (detailLoading && activeTab === "summary") {
    return (
      <div className="p-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  switch (activeTab) {
    case "summary":       return <SummaryTab />;
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
    case "quality":       return <QualityTab />;  // F-08
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