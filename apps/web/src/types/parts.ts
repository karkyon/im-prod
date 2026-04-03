// ================================================================
// 部品情報Webシステム - TypeScript型定義
// ③ サマリータブ廃止 (基本情報タブに統合)
// ================================================================

export interface PartSearchParams {
  keyword?: string;
  partId?: number;
  drawingNo?: string;
  partName?: string;
  customerId?: number;
  customer?: string;
  machineType?: string;
  isOld?: boolean;
  isSpecial?: boolean;
  isDiscontinued?: boolean;
  hasAlert?: boolean;
  page?: number;
  limit?: number;
}

export interface PartListRow {
  partId: number;
  drawingNo: string | null;
  partName: string | null;
  machineType: string | null;
  customerId: number | null;
  customerName: string | null;
  stockQty: number;
  commonPartId: number | null;
  commonPartStockQty: number;
  pendingTotal: number;
  pendingToday: number;
  scheduledInQty: number;
  completionDate: string | null;
  latestPrice: number;
  wipQty: number;
  lastInventoryInfo: string | null;
  isOld: boolean;
  isSpecial: boolean;
  isDiscontinued: boolean;
  hasDefect: boolean;
  updatedAt: string | null;
  status: "在庫注意" | "不適合あり" | "正常";
}

export interface PartSearchResult {
  rows: PartListRow[];
  total: number;
  page: number;
  limit: number;
}

export interface PartBasic {
  部品ID: number;
  工程ID: number | null;
  材料ID: number | null;
  原価ID: number | null;
  不適合ID: number | null;
  共通部品ID: number | null;
  部品単価ID: number | null;
  部品備考ID: number | null;
  得意先ID: number | null;
  得意先名: string | null;
  図面番号: string | null;
  名称: string | null;
  主機種型式: string | null;
  部品重量: number | null;
  作成日: string | null;
  旧型区分: boolean;
  特別品区分: boolean;
  廃止部品区分: boolean;
  事前準備品: boolean;
  備考: string | null;
  登録日付: string | null;
  更新日付: string | null;
  更新者: string | null;
  現在在庫数: number;
  共通部品在庫数: number;
  mat材料ID: number | null;
  材質ID: number | null;
  材質: string | null;
  材料名称: string | null;
  材料型式: string | null;
  材料サイズ: string | null;
  サイズ区分: string | null;
  材料手配区分: string | null;
  mat仕入先ID: number | null;
  材料備考: string | null;
}

export interface RemarkItem {
  id: number;
  no: number;
  text: string;
}

export interface PartRemarks {
  workProgress: RemarkItem[];
  order: RemarkItem[];
  dispatch: RemarkItem[];
  delivery: RemarkItem[];
}

// ③ "summary" を廃止 — 基本情報タブ(basic)に内容統合済み
export type PartMainTab =
  | "basic"
  | "materials"
  | "processes"
  | "production"
  | "orders"
  | "inventory"
  | "picking"
  | "cancellations"
  | "priceHistory"
  | "wip"
  | "diagrams"
  | "quality";

export const PART_TABS: { id: PartMainTab; label: string }[] = [
  { id: "basic",         label: "基本情報" },
  { id: "materials",     label: "材料/副資材" },
  { id: "processes",     label: "工程/外注見積" },
  { id: "production",    label: "生産履歴" },
  { id: "orders",        label: "受注/納品履歴" },
  { id: "inventory",     label: "入出庫履歴" },
  { id: "picking",       label: "ピッキング履歴" },
  { id: "cancellations", label: "キャンセル履歴" },
  { id: "priceHistory",  label: "単価改定履歴" },
  { id: "wip",           label: "製造進捗/仕掛" },
  { id: "diagrams",      label: "工程指示図" },
  { id: "quality",       label: "不具合" },
];