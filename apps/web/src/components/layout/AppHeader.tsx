"use client";

import { Menu } from "lucide-react";
import { usePartSearchStore } from "@/stores/partSearchStore";

export function AppHeader() {
  const { toggleSidebar, selectedBasic } = usePartSearchStore();

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
        </div>
      )}
    </header>
  );
}
