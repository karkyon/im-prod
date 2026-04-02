// ================================================================
// Zustand 状態管理ストア - quality タブ対応完全版
// apps/web/src/stores/partSearchStore.ts
// ================================================================
"use client";

import { create } from "zustand";
import type {
  PartSearchParams,
  PartListRow,
  PartBasic,
  PartRemarks,
  PartMainTab,
} from "@/types/parts";
import {
  searchParts,
  getPartBasic,
  getPartRemarks,
  getPartMaterials,
  getPartProcesses,
  getWip,
  getProductionHistory,
  getOrders,
  getInventoryMovements,
  getPickingHistory,
  getCancellations,
  getPriceHistory,
  getInstructionDiagrams,
} from "@/services/partsApi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface TabLoadState {
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

interface PartSearchStore {
  // ── 検索状態 ──
  sidebarOpen: boolean;
  conditions: PartSearchParams;
  results: PartListRow[];
  total: number;
  page: number;
  loading: boolean;
  searchError: string | null;

  // ── 選択部品状態 ──
  selectedPartId: number | null;
  selectedBasic: PartBasic | null;
  selectedRemarks: PartRemarks | null;
  selectedMaterials: AnyData | null;
  selectedProcesses: AnyData | null;
  selectedWip: AnyData[] | null;
  selectedProductionHistory: AnyData[] | null;
  selectedOrders: AnyData[] | null;
  selectedInventoryMovements: AnyData[] | null;
  selectedPickingHistory: AnyData[] | null;
  selectedCancellations: AnyData[] | null;
  selectedPriceHistory: AnyData[] | null;
  selectedInstructionDiagrams: AnyData[] | null;

  // ── タブ別ロード状態 ──
  tabLoadState: Record<PartMainTab, TabLoadState>;
  activeTab: PartMainTab;
  detailLoading: boolean;

  // ── アクション ──
  toggleSidebar: () => void;
  setConditions: (v: Partial<PartSearchParams>) => void;
  clearConditions: () => void;
  executeSearch: (page?: number) => Promise<void>;
  selectPart: (partId: number) => Promise<void>;
  setActiveTab: (tab: PartMainTab) => void;
  loadTabData: (tab: PartMainTab) => Promise<void>;
}

const DEFAULT_CONDITIONS: PartSearchParams = {
  keyword: "",
  page: 1,
  limit: 50,
};

const initialTabLoadState = (): Record<PartMainTab, TabLoadState> => ({
  summary:       { loaded: false, loading: false, error: null },
  basic:         { loaded: false, loading: false, error: null },
  materials:     { loaded: false, loading: false, error: null },
  processes:     { loaded: false, loading: false, error: null },
  production:    { loaded: false, loading: false, error: null },
  orders:        { loaded: false, loading: false, error: null },
  inventory:     { loaded: false, loading: false, error: null },
  picking:       { loaded: false, loading: false, error: null },
  cancellations: { loaded: false, loading: false, error: null },
  priceHistory:  { loaded: false, loading: false, error: null },
  wip:           { loaded: false, loading: false, error: null },
  diagrams:      { loaded: false, loading: false, error: null },
  quality:       { loaded: false, loading: false, error: null }, // F-08
});

export const usePartSearchStore = create<PartSearchStore>((set, get) => ({
  // ── 初期値 ──
  sidebarOpen: true,
  conditions: { ...DEFAULT_CONDITIONS },
  results: [],
  total: 0,
  page: 1,
  loading: false,
  searchError: null,

  selectedPartId: null,
  selectedBasic: null,
  selectedRemarks: null,
  selectedMaterials: null,
  selectedProcesses: null,
  selectedWip: null,
  selectedProductionHistory: null,
  selectedOrders: null,
  selectedInventoryMovements: null,
  selectedPickingHistory: null,
  selectedCancellations: null,
  selectedPriceHistory: null,
  selectedInstructionDiagrams: null,

  tabLoadState: initialTabLoadState(),
  activeTab: "summary",
  detailLoading: false,

  // ── サイドバー開閉 ──
  toggleSidebar: () =>
    set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // ── 検索条件更新 ──
  setConditions: (v) =>
    set((s) => ({ conditions: { ...s.conditions, ...v } })),

  clearConditions: () =>
    set({ conditions: { ...DEFAULT_CONDITIONS } }),

  // ── 検索実行 ──
  executeSearch: async (page = 1) => {
    set({ loading: true, searchError: null });
    try {
      const { conditions } = get();
      const result = await searchParts({ ...conditions, page });
      set({ results: result.rows, total: result.total, page: result.page });
    } catch (e) {
      set({ searchError: e instanceof Error ? e.message : "検索に失敗しました" });
    } finally {
      set({ loading: false });
    }
  },

  // ── 部品選択（初期データ並列取得）──
  selectPart: async (partId) => {
    set({
      selectedPartId: partId,
      detailLoading: true,
      activeTab: "summary",
      selectedBasic: null,
      selectedRemarks: null,
      selectedMaterials: null,
      selectedProcesses: null,
      selectedWip: null,
      selectedProductionHistory: null,
      selectedOrders: null,
      selectedInventoryMovements: null,
      selectedPickingHistory: null,
      selectedCancellations: null,
      selectedPriceHistory: null,
      selectedInstructionDiagrams: null,
      tabLoadState: initialTabLoadState(),
    });
    try {
      // サマリータブに必要な全データを並列取得
      const [basic, remarks, materials, processes, wip] =
        await Promise.all([
          getPartBasic(partId),
          getPartRemarks(partId),
          getPartMaterials(partId),
          getPartProcesses(partId),
          getWip(partId),
        ]);
      set({
        selectedBasic: basic,
        selectedRemarks: remarks,
        selectedMaterials: materials,
        selectedProcesses: processes,
        selectedWip: wip,
        tabLoadState: {
          ...get().tabLoadState,
          summary:   { loaded: true, loading: false, error: null },
          basic:     { loaded: true, loading: false, error: null },
          materials: { loaded: true, loading: false, error: null },
          processes: { loaded: true, loading: false, error: null },
          wip:       { loaded: true, loading: false, error: null },
        },
      });
    } catch (e) {
      console.error("部品詳細取得エラー:", e);
    } finally {
      set({ detailLoading: false });
    }
  },

  // ── タブ切替（未ロードなら自動フェッチ）──
  setActiveTab: async (tab) => {
    set({ activeTab: tab });
    const { selectedPartId, tabLoadState } = get();
    if (!selectedPartId) return;
    // quality タブは QualityTab 内部で独自フェッチするためスキップ
    if (tab === "quality") return;
    if (!tabLoadState[tab].loaded && !tabLoadState[tab].loading) {
      get().loadTabData(tab);
    }
  },

  // ── タブ別データ遅延ロード ──
  loadTabData: async (tab) => {
    const { selectedPartId } = get();
    if (!selectedPartId) return;

    set((s) => ({
      tabLoadState: {
        ...s.tabLoadState,
        [tab]: { loaded: false, loading: true, error: null },
      },
    }));

    try {
      switch (tab) {
        case "production": {
          const data = await getProductionHistory(selectedPartId);
          set({ selectedProductionHistory: data });
          break;
        }
        case "orders": {
          const data = await getOrders(selectedPartId);
          set({ selectedOrders: data });
          break;
        }
        case "inventory": {
          const data = await getInventoryMovements(selectedPartId);
          set({ selectedInventoryMovements: data });
          break;
        }
        case "picking": {
          const data = await getPickingHistory(selectedPartId);
          set({ selectedPickingHistory: data });
          break;
        }
        case "cancellations": {
          const data = await getCancellations(selectedPartId);
          set({ selectedCancellations: data });
          break;
        }
        case "priceHistory": {
          const data = await getPriceHistory(selectedPartId);
          set({ selectedPriceHistory: data });
          break;
        }
        case "diagrams": {
          const data = await getInstructionDiagrams(selectedPartId);
          set({ selectedInstructionDiagrams: data });
          break;
        }
        default:
          break;
      }
      set((s) => ({
        tabLoadState: {
          ...s.tabLoadState,
          [tab]: { loaded: true, loading: false, error: null },
        },
      }));
    } catch (e) {
      set((s) => ({
        tabLoadState: {
          ...s.tabLoadState,
          [tab]: {
            loaded: false,
            loading: false,
            error: e instanceof Error ? e.message : "取得失敗",
          },
        },
      }));
    }
  },
}));