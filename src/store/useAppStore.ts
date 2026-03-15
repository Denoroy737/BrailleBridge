/**
 * src/store/useAppStore.ts
 * Zustand store: theme, grade preference, and conversion history.
 * Persists to localStorage via the persist middleware.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId, truncate } from "@/lib/braille/utils";

export type BrailleGrade    = 1 | 2;
export type ThemePreference = "light" | "dark" | "system";
export type ActiveTab       = "encode" | "decode" | "reference";

export interface HistoryEntry {
  id:        string;
  timestamp: number;
  direction: "encode" | "decode";
  grade:     BrailleGrade;
  input:     string;
  output:    string;
  warnings?: string[] | undefined;
}

interface AppState {
  // History
  history:          HistoryEntry[];
  addToHistory:     (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  removeFromHistory:(id: string) => void;
  clearHistory:     () => void;
  // Theme
  theme:    ThemePreference;
  setTheme: (t: ThemePreference) => void;
  // Grade
  grade:    BrailleGrade;
  setGrade: (g: BrailleGrade) => void;
  // Tab
  activeTab:    ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // History panel
  historyOpen:    boolean;
  setHistoryOpen: (open: boolean) => void;
}

const MAX_HISTORY = 50;

function applyTheme(theme: ThemePreference): void {
  if (typeof document === "undefined") return;
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem("bb-theme", theme); } catch { /* ignore */ }
}

// Safe localStorage reference for SSR
const safeStorage = typeof window !== "undefined"
  ? localStorage
  : {
      getItem:    (_: string) => null,
      setItem:    (_: string, __: string) => undefined,
      removeItem: (_: string) => undefined,
    };

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // ── History ──────────────────────────────────────────────────────
      history: [],

      addToHistory: (entry) =>
        set((s) => ({
          history: [
            {
              ...entry,
              id:        generateId(),
              timestamp: Date.now(),
              input:     truncate(entry.input,  500),
              output:    truncate(entry.output, 500),
            },
            ...s.history,
          ].slice(0, MAX_HISTORY),
        })),

      removeFromHistory: (id) =>
        set((s) => ({ history: s.history.filter((e) => e.id !== id) })),

      clearHistory: () => set({ history: [] }),

      // ── Theme ─────────────────────────────────────────────────────────
      theme: "system",
      setTheme: (theme) => { applyTheme(theme); set({ theme }); },

      // ── Grade ─────────────────────────────────────────────────────────
      grade: 1,
      setGrade: (grade) => set({ grade }),

      // ── Tab ───────────────────────────────────────────────────────────
      activeTab: "encode",
      setActiveTab: (activeTab) => set({ activeTab }),

      // ── History panel ─────────────────────────────────────────────────
      historyOpen: false,
      setHistoryOpen: (historyOpen) => set({ historyOpen }),
    }),
    {
      name:    "braillebridge-store",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        history: s.history,
        theme:   s.theme,
        grade:   s.grade,
      }),
    }
  )
);
