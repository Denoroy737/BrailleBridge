"use client";
import { Sun, Moon, Monitor, History } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import type { ThemePreference } from "@/store/useAppStore";

const THEMES: { value: ThemePreference; icon: React.ReactNode; label: string }[] = [
  { value: "light",  icon: <Sun size={13} />,     label: "Light"  },
  { value: "dark",   icon: <Moon size={13} />,    label: "Dark"   },
  { value: "system", icon: <Monitor size={13} />, label: "System" },
];

export function Header() {
  const { theme, setTheme, historyOpen, setHistoryOpen } = useAppStore();
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#1a1a1a] border-b border-[#ddd] dark:border-[#333]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl font-mono leading-none select-none shrink-0" aria-hidden>⠃⠗</span>
          <div className="min-w-0">
            <h1 className="text-base font-semibold leading-tight tracking-tight">BrailleBridge</h1>
            <p className="text-xs text-[#666] dark:text-[#999] leading-tight">Grade 1 &amp; 2 UEB Converter</p>
          </div>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-md border border-[#ddd] dark:border-[#333] overflow-hidden"
            role="group" aria-label="Colour theme">
            {THEMES.map((t) => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                aria-label={`${t.label} theme`} aria-pressed={theme === t.value}
                className={`px-2.5 py-1.5 flex items-center gap-1 text-xs transition-colors
                  ${theme === t.value
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-white dark:bg-[#1a1a1a] text-[#666] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#222]"
                  }`}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-label={historyOpen ? "Close history" : "Open conversion history"}
            aria-expanded={historyOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#ddd] dark:border-[#333]
              rounded-md hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-colors">
            <History size={13} />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </div>
    </header>
  );
}
