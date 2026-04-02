// ================================================================
// CSV出力ユーティリティ
// apps/web/src/services/csvExport.ts
// ================================================================

/**
 * 値をCSVセル用にエスケープする
 * - カンマ・改行・ダブルクォートを含む場合はダブルクォートで囲む
 */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * rows（オブジェクト配列）からCSV文字列を生成する
 */
function buildCsv(
  headers: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[]
): string {
  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

/**
 * CSV文字列をBOM付きでダウンロードさせる
 */
function downloadCsv(csv: string, filename: string): void {
  const BOM = "\uFEFF"; // Excelでの文字化け防止
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * タイムスタンプ付きファイル名を生成する
 */
function timestampedFilename(prefix: string): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${prefix}_${ts}.csv`;
}

// ────────────────────────────────────────────────────────────────
// 部品検索一覧 CSV
// ────────────────────────────────────────────────────────────────
import type { PartListRow } from "@/types/parts";

export function exportPartsListCsv(rows: PartListRow[]): void {
  const headers = [
    "partId",
    "drawingNo",
    "partName",
    "machineType",
    "customerName",
    "stockQty",
    "commonPartId",
    "commonPartStockQty",
    "pendingTotal",
    "pendingToday",
    "scheduledInQty",
    "completionDate",
    "latestPrice",
    "wipQty",
    "isOld",
    "isSpecial",
    "isDiscontinued",
    "hasDefect",
    "status",
    "updatedAt",
  ];

  const headerLabels = [
    "部品ID",
    "図面番号",
    "名称",
    "主機種型式",
    "得意先名",
    "現在在庫数",
    "共通部品ID",
    "共通部品在庫数",
    "総注残",
    "今日注残",
    "入荷予定数",
    "完成期日",
    "最新単価",
    "仕掛件数",
    "旧型",
    "特別品",
    "廃止品",
    "不適合あり",
    "ステータス",
    "更新日付",
  ];

  const csvRows = rows.map((row) => {
    const mapped: Record<string, unknown> = {};
    headers.forEach((key, i) => {
      const val = (row as Record<string, unknown>)[key];
      if (typeof val === "boolean") {
        mapped[headerLabels[i]] = val ? "○" : "";
      } else {
        mapped[headerLabels[i]] = val;
      }
    });
    return mapped;
  });

  const csv = buildCsv(headerLabels, csvRows);
  downloadCsv(csv, timestampedFilename("parts_list"));
}

// ────────────────────────────────────────────────────────────────
// 受注/納品履歴 CSV
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportOrdersCsv(rows: any[], partId: number): void {
  const headerLabels = [
    "取引先伝票番号",
    "受注数量",
    "納期",
    "出庫数量",
    "出庫日",
    "入力日",
    "単価",
    "金額",
    "検収金額",
    "検収日",
    "納品状況",
    "完納",
    "納品場所",
    "備考",
  ];
  const csv = buildCsv(headerLabels, rows);
  downloadCsv(csv, timestampedFilename(`orders_${partId}`));
}

// ────────────────────────────────────────────────────────────────
// 入出庫履歴 CSV
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportInventoryCsv(rows: any[], partId: number): void {
  const headerLabels = [
    "入出庫区分",
    "移動日",
    "入庫数量",
    "出庫数量",
    "入庫区分",
    "出庫区分",
    "伝票番号",
    "生産No",
    "備考",
  ];
  const csv = buildCsv(headerLabels, rows);
  downloadCsv(csv, timestampedFilename(`inventory_${partId}`));
}

// ────────────────────────────────────────────────────────────────
// 生産履歴 CSV
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportProductionCsv(rows: any[], partId: number): void {
  const headerLabels = [
    "生産No",
    "削除",
    "材料発注No",
    "外注発注No",
    "生産予定数",
    "生産手配日",
    "完成期日",
    "生産完了日",
    "完成数",
    "備考",
  ];
  const csv = buildCsv(headerLabels, rows);
  downloadCsv(csv, timestampedFilename(`production_${partId}`));
}

// ────────────────────────────────────────────────────────────────
// 単価改定履歴 CSV
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportPriceHistoryCsv(rows: any[], partId: number): void {
  const headerLabels = [
    "単価区分",
    "通貨区分",
    "単価",
    "改定日付",
    "適用開始日付",
    "客先担当者",
    "事由",
  ];
  const csv = buildCsv(headerLabels, rows);
  downloadCsv(csv, timestampedFilename(`price_history_${partId}`));
}

// ────────────────────────────────────────────────────────────────
// キャンセル履歴 CSV
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportCancellationsCsv(rows: any[], partId: number): void {
  const headerLabels = [
    "受注番号",
    "取引先伝票番号",
    "受注数量",
    "出庫数量",
    "納期",
    "出庫日",
    "単価",
    "金額",
    "検収金額",
    "検収日",
    "削除区分",
    "完納区分",
    "キャンセル理由",
    "最終更新日",
  ];
  const csv = buildCsv(headerLabels, rows);
  downloadCsv(csv, timestampedFilename(`cancellations_${partId}`));
}

// ────────────────────────────────────────────────────────────────
// ピッキング履歴 CSV
// ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportPickingCsv(rows: any[], partId: number): void {
  const headerLabels = [
    "作業日",
    "作業時刻",
    "出荷日",
    "数量",
    "IPアドレス",
    "図面番号",
    "名称",
    "主機種型式",
  ];
  const csv = buildCsv(headerLabels, rows);
  downloadCsv(csv, timestampedFilename(`picking_${partId}`));
}

// ────────────────────────────────────────────────────────────────
// 汎用: 任意テーブルデータをCSV出力する
// ────────────────────────────────────────────────────────────────
export function exportGenericCsv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: any[],
  headers: string[],
  filename: string
): void {
  const csv = buildCsv(headers, rows);
  downloadCsv(csv, timestampedFilename(filename));
}