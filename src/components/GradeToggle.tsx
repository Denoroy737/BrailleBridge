"use client";
import { useAppStore } from "@/store/useAppStore";
import type { BrailleGrade } from "@/store/useAppStore";

interface Props { className?: string | undefined }

const OPTIONS: { value: BrailleGrade; label: string; sub: string }[] = [
  { value: 1, label: "Grade 1", sub: "Uncontracted" },
  { value: 2, label: "Grade 2", sub: "Contracted"   },
];

export function GradeToggle({ className = "" }: Props) {
  const { grade, setGrade } = useAppStore();
  return (
    <div
      className={`flex rounded-lg border border-[#ddd] dark:border-[#333] overflow-hidden shrink-0 ${className}`}
      role="group"
      aria-label="Select Braille grade"
    >
      {OPTIONS.map((opt) => {
        const active = grade === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setGrade(opt.value)}
            aria-pressed={active}
            aria-label={`${opt.label} — ${opt.sub}`}
            className={`px-4 py-2 text-left transition-colors
              ${active
                ? "bg-black dark:bg-white text-white dark:text-black"
                : "bg-white dark:bg-[#1a1a1a] text-[#555] dark:text-[#999] hover:bg-[#f0f0f0] dark:hover:bg-[#222]"
              }`}
          >
            <span className="block text-xs font-semibold leading-tight">{opt.label}</span>
            <span className="block text-xs opacity-60 leading-tight">{opt.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
