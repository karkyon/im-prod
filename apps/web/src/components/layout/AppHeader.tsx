"use client";

// ================================================================
// AppHeader
// ①-A 修正: ヘッダーから部品詳細情報を削除（PartKartePanelに表示を集約）
// ================================================================

import { Menu, Download } from "lucide-react";
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
    selectedPartId,
    activeTab,
    selectedOrders,
    selectedInventoryMovements,
    selectedProductionHistory,
    selectedPriceHistory,
    selectedCancellations,
    selectedPickingHistory,
  } = usePartSearchStore();

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

      {/* ①-A: 部品詳細情報の重複表示を削除。詳細は PartKartePanel に集約 */}
      <span className="font-semibold text-sm text-foreground select-none">
        部品情報システム
      </span>

      {/* 右側ボタン群 */}
      <div className="ml-auto flex items-center gap-2">
        {canExportCsv && (
          <button
            onClick={handleTabCsv}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-input rounded-md hover:bg-muted transition-colors text-muted-foreground"
            title="現在のタブをCSV出力"
          >
            <Download size={13} />
            CSV出力
          </button>
        )}
      </div>
    </header>
  );
}