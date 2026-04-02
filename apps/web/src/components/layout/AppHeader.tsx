"use client";

// ================================================================
// AppHeader - CSV出力ボタン追加版
// apps/web/src/components/layout/AppHeader.tsx
// ================================================================

import { Menu, Download, FileText } from "lucide-react";
import { usePartSearchStore } from "@/stores/partSearchStore";
import {
  exportOrdersCsv,
  exportInventoryCsv,
  exportProductionCsv,
  exportPriceHistoryCsv,
  exportCancellationsCsv,
  exportPickingCsv,
} from "@/services/csvExport";

export function AppHeader() {
  const {
    toggleSidebar,
    selectedBasic,
    selectedPartId,
    activeTab,
    selectedOrders,
    selectedInventoryMovements,
    selectedProductionHistory,
    selectedPriceHistory,
    selectedCancellations,
    selectedPickingHistory,
  } = usePartSearchStore();

  /** 現在アクティブなタブに応じてCSV出力 */
  const handleTabCsv = () => {
    if (!selectedPartId) return;
    switch (activeTab) {
      case "orders":
        if (selectedOrders)
          exportOrdersCsv(selectedOrders, selectedPartId);
        break;
      case "inventory":
        if (selectedInventoryMovements)
          exportInventoryCsv(selectedInventoryMovements, selectedPartId);
        break;
      case "production":
        if (selectedProductionHistory)
          exportProductionCsv(selectedProductionHistory, selectedPartId);
        break;
      case "priceHistory":
        if (selectedPriceHistory)
          exportPriceHistoryCsv(selectedPriceHistory, selectedPartId);
        break;
      case "cancellations":
        if (selectedCancellations)
          exportCancellationsCsv(selectedCancellations, selectedPartId);
        break;
      case "picking":
        if (selectedPickingHistory)
          exportPickingCsv(selectedPickingHistory, selectedPartId);
        break;
      default:
        return;
    }
  };

  /** CSV出力が可能なタブかどうか */
  const csvAvailableTabs = [
    "orders",
    "inventory",
    "production",
    "priceHistory",
    "cancellations",
    "picking",
  ];
  const canExportCsv =
    selectedPartId != null && csvAvailableTabs.includes(activeTab);

  return (
    <header className="h-12 flex items-center gap-3 px-3 border-b border-border bg-background shrink-0 z-30">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded hover:bg-muted transition-colors"
        title="検索サイドバー開閉"
      >
        <Menu size={18} />
      </button>

      <span className="font-semibold text-sm text-foreground select-none">
        部品情報システム
      </span>

      {selectedBasic && (
        <div className="flex items-center gap-2 ml-4 text-xs text-muted-foreground">
          <span className="font-mono font-bold text-foreground">
            #{selectedBasic.部品ID}
          </span>
          <span className="text-border">|</span>
          <span>{selectedBasic.図面番号 ?? "—"}</span>
          <span className="text-border">|</span>
          <span className="max-w-48 truncate">{selectedBasic.名称 ?? "—"}</span>
          {/* 部品重量: 0の場合は表示しない */}
          {selectedBasic.部品重量 != null && selectedBasic.部品重量 > 0 && (
            <>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">
                {selectedBasic.部品重量} kg
              </span>
            </>
          )}
        </div>
      )}

      {/* 右側ボタン群 */}
      <div className="ml-auto flex items-center gap-2">
        {/* タブCSV出力ボタン */}
        {canExportCsv && (
          <button
            onClick={handleTabCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-input rounded-md hover:bg-muted transition-colors text-muted-foreground"
            title={`現在のタブをCSV出力`}
          >
            <Download size={13} />
            CSV出力
          </button>
        )}
      </div>
    </header>
  );
}