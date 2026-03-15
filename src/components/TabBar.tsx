"use client";
import { useAppStore } from "@/store/useAppStore";
import type { ActiveTab } from "@/store/useAppStore";

const TABS: { id: ActiveTab; label: string; desc: string }[] = [
  { id: "encode",    label: "Encode",    desc: "English → Braille" },
  { id: "decode",    label: "Decode",    desc: "Braille → English" },
  { id: "reference", label: "Reference", desc: "UEB symbol chart"  },
];

export function TabBar() {
  const { activeTab, setActiveTab } = useAppStore();
  return (
    <nav className="flex border-b border-[#ddd] dark:border-[#333] mb-8"
      aria-label="Main navigation" role="tablist">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-none sm:px-6 py-3 text-sm font-medium
              transition-all border-b-2 -mb-px
              ${active
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-[#666] dark:text-[#999] hover:text-black dark:hover:text-white hover:border-[#bbb] dark:hover:border-[#555]"
              }`}
          >
            <span className="block">{tab.label}</span>
            <span className="block text-xs font-normal opacity-60 hidden sm:block">{tab.desc}</span>
          </button>
        );
      })}
    </nav>
  );
}
