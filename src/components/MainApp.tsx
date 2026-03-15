"use client";
/**
 * src/components/MainApp.tsx
 * Root client shell. Reads ?tab= URL param, renders active panel.
 */

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore }    from "@/store/useAppStore";
import { Header }         from "./Header";
import { TabBar }         from "./TabBar";
import { EncoderPanel }   from "./EncoderPanel";
import { DecoderPanel }   from "./DecoderPanel";
import { ReferencePanel } from "./ReferencePanel";
import { HistoryDrawer }  from "./HistoryDrawer";

const PANEL = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.2, ease: "easeOut" } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

export function MainApp() {
  const { activeTab, setActiveTab, historyOpen } = useAppStore();
  const searchParams = useSearchParams();

  // Sync tab from URL
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "encode" || t === "decode" || t === "reference") setActiveTab(t);
  }, [searchParams, setActiveTab]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#111] text-black dark:text-[#eee] transition-colors">
      <Header />

      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8 pb-24">
        <TabBar />

        <AnimatePresence mode="wait">
          {activeTab === "encode" && (
            <motion.div key="encode" variants={PANEL} initial="hidden" animate="visible" exit="exit">
              <EncoderPanel />
            </motion.div>
          )}
          {activeTab === "decode" && (
            <motion.div key="decode" variants={PANEL} initial="hidden" animate="visible" exit="exit">
              <DecoderPanel />
            </motion.div>
          )}
          {activeTab === "reference" && (
            <motion.div key="reference" variants={PANEL} initial="hidden" animate="visible" exit="exit">
              <ReferencePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {historyOpen && <HistoryDrawer />}
      </AnimatePresence>
    </div>
  );
}
