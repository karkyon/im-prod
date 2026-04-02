// ================================================================
// Zustand 状態管理ストア
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
} from "@/services/partsApi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

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
  activeTab: PartMainTab;
  detailLoading: boolean;

  // ── アクション ──
  toggleSidebar: () => void;
  setConditions: (v: Partial<PartSearchParams>) => void;
  clearConditions: () => void;
  executeSearch: (page?: number) => Promise<void>;
  selectPart: (partId: number) => Promise<void>;
  setActiveTab: (tab: PartMainTab) => void;
}

const DEFAULT_CONDITIONS: PartSearchParams = {
  keyword: "",
  page: 1,
  limit: 50,
};

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
      set({
        results: result.rows,
        total: result.total,
        page: result.page,
      });
    } catch (e) {
      set({
        searchError:
          e instanceof Error ? e.message : "検索に失敗しました",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ── 部品選択 ──
  selectPart: async (partId) => {
    set({
      selectedPartId: partId,
      detailLoading: true,
      activeTab: "summary",
      // 前の部品データをリセット
      selectedBasic: null,
      selectedRemarks: null,
      selectedMaterials: null,
      selectedProcesses: null,
      selectedWip: null,
    });
    try {
      // 基本データを並列取得（サマリータブに必要な全データ）
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
      });
    } catch (e) {
      console.error("部品詳細取得エラー:", e);
    } finally {
      set({ detailLoading: false });
    }
  },

  // ── タブ切替 ──
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
