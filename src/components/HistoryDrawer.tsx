"use client";
/**
 * src/components/HistoryDrawer.tsx
 * Slide-in history panel. Rendered inside AnimatePresence in MainApp.
 */

import { motion } from "framer-motion";
import { X, Trash2, Clock, ArrowRight } from "lucide-react";
import { useAppStore }  from "@/store/useAppStore";
import { truncate }     from "@/lib/braille/utils";

export function HistoryDrawer() {
  const {
    history, removeFromHistory, clearHistory,
    setHistoryOpen, setActiveTab,
  } = useAppStore();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-40"
        onClick={() => setHistoryOpen(false)}
        aria-hidden
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-96 z-50 flex flex-col
          bg-white dark:bg-[#1a1a1a] border-l border-[#ddd] dark:border-[#333]"
        role="complementary"
        aria-label="Conversion history"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0
          border-b border-[#ddd] dark:border-[#333]">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Clock size={13} aria-hidden />
            History ({history.length})
          </h2>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button onClick={clearHistory}
                aria-label="Clear all history"
                className="flex items-center gap-1 text-xs text-[#777] hover:text-black dark:hover:text-white transition-colors">
                <Trash2 size={11} /> Clear all
              </button>
            )}
            <button onClick={() => setHistoryOpen(false)} aria-label="Close history"
              className="text-[#777] hover:text-black dark:hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" role="list">
          {history.length === 0 ? (
            <p className="text-sm text-[#aaa] dark:text-[#555] text-center py-10">
              No history yet. Try converting some text.
            </p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} role="listitem"
                className="group rounded-lg border border-[#eee] dark:border-[#222] p-3 space-y-1.5
                  hover:border-[#ccc] dark:hover:border-[#444] transition-colors">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-[#999] dark:text-[#666]">
                      {entry.direction === "encode" ? "→ Braille" : "→ Text"}
                    </span>
                    <span className={`text-xs px-1.5 leading-5 rounded font-medium
                      ${entry.grade === 2 ? "badge-g2" : "badge-g1"}`}>
                      G{entry.grade}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setActiveTab(entry.direction); setHistoryOpen(false); }}
                      className="flex items-center gap-0.5 text-xs px-2 py-0.5
                        border border-[#ddd] dark:border-[#333] rounded
                        hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-colors"
                      aria-label="Open this tab">
                      <ArrowRight size={9} /> Open
                    </button>
                    <button onClick={() => removeFromHistory(entry.id)}
                      className="text-xs px-1.5 py-0.5 border border-[#ddd] dark:border-[#333] rounded
                        hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-colors"
                      aria-label="Remove entry">
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-mono text-[#555] dark:text-[#999] truncate">
                  <span className="text-[#bbb] dark:text-[#666]">In: </span>
                  {truncate(entry.input, 55)}
                </p>
                <p className={`text-xs truncate
                  ${entry.direction === "encode" ? "braille-output text-base leading-none" : "font-mono"}`}>
                  <span className="text-[#bbb] dark:text-[#666] font-sans text-xs">Out: </span>
                  {truncate(entry.output, 55)}
                </p>

                {(entry.warnings?.length ?? 0) > 0 && (
                  <p className="text-xs text-[#aaa] dark:text-[#666]">
                    ⚠ {entry.warnings!.length} warning{entry.warnings!.length > 1 ? "s" : ""}
                  </p>
                )}

                <time dateTime={new Date(entry.timestamp).toISOString()}
                  className="text-xs text-[#ccc] dark:text-[#555] block">
                  {new Date(entry.timestamp).toLocaleString()}
                </time>
              </div>
            ))
          )}
        </div>
      </motion.aside>
    </>
  );
}
