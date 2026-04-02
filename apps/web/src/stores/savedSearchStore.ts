// ================================================================
// 検索条件保存ストア (F-02)
// LocalStorage を使った個人用保存条件管理
// apps/web/src/stores/savedSearchStore.ts
// ================================================================
"use client";

import { create } from "zustand";
import type { PartSearchParams } from "@/types/parts";

const STORAGE_KEY = "im-prod:saved-searches";
const MAX_SAVED = 20;

export interface SavedSearch {
  id: string;
  name: string;
  conditions: PartSearchParams;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SavedSearchStore {
  savedSearches: SavedSearch[];
  loadFromStorage: () => void;
  saveSearch: (name: string, conditions: PartSearchParams) => void;
  updateSearch: (id: string, name: string, conditions: PartSearchParams) => void;
  deleteSearch: (id: string) => void;
  setDefault: (id: string) => void;
  clearDefault: () => void;
  getDefault: () => SavedSearch | null;
}

function readStorage(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSearch[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(searches: SavedSearch[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // quota exceeded などは無視
  }
}

function generateId(): string {
  return `ss_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useSavedSearchStore = create<SavedSearchStore>((set, get) => ({
  savedSearches: [],

  loadFromStorage: () => {
    set({ savedSearches: readStorage() });
  },

  saveSearch: (name, conditions) => {
    const now = new Date().toISOString();
    const newEntry: SavedSearch = {
      id: generateId(),
      name: name.trim() || "名称なし",
      conditions,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newEntry, ...get().savedSearches].slice(0, MAX_SAVED);
    writeStorage(updated);
    set({ savedSearches: updated });
  },

  updateSearch: (id, name, conditions) => {
    const updated = get().savedSearches.map((s) =>
      s.id === id
        ? { ...s, name: name.trim(), conditions, updatedAt: new Date().toISOString() }
        : s
    );
    writeStorage(updated);
    set({ savedSearches: updated });
  },

  deleteSearch: (id) => {
    const updated = get().savedSearches.filter((s) => s.id !== id);
    writeStorage(updated);
    set({ savedSearches: updated });
  },

  setDefault: (id) => {
    const updated = get().savedSearches.map((s) => ({
      ...s,
      isDefault: s.id === id,
    }));
    writeStorage(updated);
    set({ savedSearches: updated });
  },

  clearDefault: () => {
    const updated = get().savedSearches.map((s) => ({
      ...s,
      isDefault: false,
    }));
    writeStorage(updated);
    set({ savedSearches: updated });
  },

  getDefault: () => {
    return get().savedSearches.find((s) => s.isDefault) ?? null;
  },
}));