// ================================================================
// Express API (port 3041) への通信層
// ================================================================

import type {
  PartSearchParams,
  PartSearchResult,
  PartBasic,
  PartRemarks,
} from "@/types/parts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3041";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── 部品検索 ─────────────────────────────────────────────────────
export async function searchParts(
  params: PartSearchParams
): Promise<PartSearchResult> {
  const q = new URLSearchParams();
  if (params.keyword)        q.set("keyword",        params.keyword);
  if (params.partId)         q.set("partId",         String(params.partId));
  if (params.drawingNo)      q.set("drawingNo",      params.drawingNo);
  if (params.partName)       q.set("partName",       params.partName);
  if (params.customerId)     q.set("customerId",     String(params.customerId));
  if (params.customer)       q.set("customer",       params.customer);
  if (params.machineType)    q.set("machineType",    params.machineType);
  if (params.isOld !== undefined)          q.set("isOld",          String(params.isOld));
  if (params.isSpecial !== undefined)      q.set("isSpecial",      String(params.isSpecial));
  if (params.isDiscontinued !== undefined) q.set("isDiscontinued", String(params.isDiscontinued));
  if (params.hasAlert)       q.set("hasAlert",       "true");
  if (params.page)           q.set("page",           String(params.page));
  if (params.limit)          q.set("limit",          String(params.limit));

  return apiFetch<PartSearchResult>(`/api/parts/search?${q.toString()}`);
}

// ── 基本情報 ─────────────────────────────────────────────────────
export async function getPartBasic(partId: number): Promise<PartBasic> {
  return apiFetch<PartBasic>(`/api/parts/${partId}/basic`);
}

// ── 備考 ─────────────────────────────────────────────────────────
export async function getPartRemarks(partId: number): Promise<PartRemarks> {
  return apiFetch<PartRemarks>(`/api/parts/${partId}/remarks`);
}

// ── 材料/副資材 ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPartMaterials(partId: number): Promise<any> {
  return apiFetch(`/api/parts/${partId}/materials`);
}

// ── 工程/外注見積 ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPartProcesses(partId: number): Promise<any> {
  return apiFetch(`/api/parts/${partId}/processes`);
}

// ── 生産履歴 ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProductionHistory(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/production-history`);
}

// ── 受注/納品履歴 ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOrders(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/orders`);
}

// ── 入出庫履歴 ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getInventoryMovements(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/inventory-movements`);
}

// ── ピッキング履歴 ────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPickingHistory(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/picking-history`);
}

// ── キャンセル履歴 ────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCancellations(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/cancellations`);
}

// ── 単価改定履歴 ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPriceHistory(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/price-history`);
}

// ── 製造進捗/仕掛 ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getWip(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/wip`);
}

// ── 工程指示図 ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getInstructionDiagrams(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/instruction-diagrams`);
}

// ── 不具合一覧 (F-08) ────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getIssues(partId: number): Promise<any[]> {
  return apiFetch(`/api/parts/${partId}/issues`);
}