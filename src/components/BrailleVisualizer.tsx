"use client";
/**
 * src/components/BrailleVisualizer.tsx
 * Interactive 6-dot Braille cell editor with meaning display and alphabet picker.
 * Dot layout (standard UEB physical cell):
 *   col 0  col 1
 *   dot1   dot4   (row 0)
 *   dot2   dot5   (row 1)
 *   dot3   dot6   (row 2)
 */

import { useState } from "react";
import { X } from "lucide-react";
import {
  brailleToDotPattern, dotPatternToBraille,
  REVERSE_LETTER_MAP, REVERSE_PUNCTUATION_MAP, LETTER_MAP,
} from "@/lib/braille/mappings";

interface Props {
  cell?:    string   | undefined;
  onClose?: (() => void) | undefined;
}

// Grid positions: { dot, row, col }
const GRID = [
  { dot: 1, row: 0, col: 0 }, { dot: 4, row: 0, col: 1 },
  { dot: 2, row: 1, col: 0 }, { dot: 5, row: 1, col: 1 },
  { dot: 3, row: 2, col: 0 }, { dot: 6, row: 2, col: 1 },
] as const;

function getMeaning(cell: string): string {
  const letter = REVERSE_LETTER_MAP[cell];
  if (letter !== undefined) return `Letter "${letter.toUpperCase()}"`;
  const punct = REVERSE_PUNCTUATION_MAP[cell];
  if (punct !== undefined) return `Punctuation "${punct}"`;
  const cp = cell.codePointAt(0) ?? 0;
  if (cp === 0x2800) return "Blank / space cell";
  return "Indicator or contraction cell";
}

export function BrailleVisualizer({ cell: initialCell = "\u2801", onClose }: Props) {
  const [activeDots, setActiveDots] = useState<Set<number>>(() => {
    const pattern = brailleToDotPattern(initialCell);
    return new Set(pattern.split("").map(Number).filter(Boolean));
  });

  const currentCell = dotPatternToBraille([...activeDots].sort((a, b) => a - b).join(""));
  const meaning     = getMeaning(currentCell);
  const cpHex       = `U+${(currentCell.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`;
  const dotStr      = activeDots.size > 0 ? `dots ${[...activeDots].sort((a, b) => a - b).join("")}` : "no dots";

  const toggle = (dot: number) =>
    setActiveDots((prev) => {
      const next = new Set(prev);
      if (next.has(dot)) next.delete(dot); else next.add(dot);
      return next;
    });

  const pickLetter = (l: string) => {
    const c = LETTER_MAP[l];
    if (!c) return;
    const pattern = brailleToDotPattern(c);
    setActiveDots(new Set(pattern.split("").map(Number).filter(Boolean)));
  };

  return (
    <div role="region" aria-label="Interactive Braille cell visualizer"
      className="rounded-lg border border-[#ddd] dark:border-[#333]
        bg-white dark:bg-[#1a1a1a] p-5 max-w-[280px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold">Cell Visualizer</h2>
          <p className="text-xs text-[#777] dark:text-[#777] mt-0.5">Click dots to toggle</p>
        </div>
        {onClose !== undefined && (
          <button onClick={onClose} aria-label="Close visualizer"
            className="text-[#777] hover:text-black dark:hover:text-white transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {/* 6-dot grid */}
      <div
        className="grid gap-3 mx-auto w-fit mb-5"
        style={{ gridTemplateColumns: "repeat(2,2.75rem)", gridTemplateRows: "repeat(3,2.75rem)" }}
        role="group" aria-label="Braille dot grid"
      >
        {GRID.map(({ dot, row, col }) => {
          const filled = activeDots.has(dot);
          return (
            <button
              key={dot}
              onClick={() => toggle(dot)}
              aria-label={`Dot ${dot} — ${filled ? "filled" : "empty"}`}
              aria-pressed={filled}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center
                text-xs font-mono transition-all select-none
                ${filled
                  ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black"
                  : "bg-transparent border-[#ccc] dark:border-[#555] text-[#bbb] dark:text-[#666] hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                }`}
            >
              {dot}
            </button>
          );
        })}
      </div>

      {/* Current cell info */}
      <div className="text-center space-y-1 pb-4 border-b border-[#eee] dark:border-[#222]">
        <div className="braille-output text-5xl leading-none" aria-label={`Current cell: ${meaning}`}>
          {currentCell}
        </div>
        <p className="text-sm font-medium">{meaning}</p>
        <p className="text-xs text-[#aaa] dark:text-[#666] font-mono">{cpHex} · {dotStr}</p>
      </div>

      {/* Alphabet quick-pick */}
      <div className="mt-4">
        <p className="text-xs font-medium text-[#666] dark:text-[#999] mb-2">Quick pick a–z</p>
        <div className="flex flex-wrap gap-1">
          {"abcdefghijklmnopqrstuvwxyz".split("").map((l) => (
            <button
              key={l}
              onClick={() => pickLetter(l)}
              aria-label={`Show dot pattern for ${l}`}
              className="text-xs px-1.5 py-0.5 border border-[#eee] dark:border-[#333]
                rounded hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-colors"
            >{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
