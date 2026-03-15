"use client";
/**
 * src/components/ReferencePanel.tsx
 * Searchable, filterable UEB reference table (Grade 1 + 2).
 */

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import {
  LETTER_MAP, DIGIT_MAP, PUNCTUATION_MAP,
  INDICATORS, brailleToDotPattern,
} from "@/lib/braille/mappings";
import { ALL_CONTRACTIONS } from "@/lib/braille/grade2/contractions";

interface RefRow {
  print:      string;
  braille:    string;
  grade:      1 | 2;
  category:   string;
  dotPattern: string;
  note:       string;
}

// Build the master reference table once at module load time
const ALL_ROWS: RefRow[] = (() => {
  const rows: RefRow[] = [];

  // Grade 1 — letters
  for (const [l, cell] of Object.entries(LETTER_MAP)) {
    rows.push({ print: l, braille: cell, grade: 1, category: "Letter",
      dotPattern: brailleToDotPattern(cell), note: "" });
  }
  // Grade 1 — digits
  for (const [d, cell] of Object.entries(DIGIT_MAP)) {
    rows.push({ print: d, braille: `\u283c${cell}`, grade: 1, category: "Digit",
      dotPattern: `⠼+${brailleToDotPattern(cell)}`, note: "Numeric mode" });
  }
  // Grade 1 — punctuation (deduplicated by print symbol)
  const seenP = new Set<string>();
  for (const [sym, cells] of Object.entries(PUNCTUATION_MAP)) {
    if (seenP.has(sym)) continue;
    seenP.add(sym);
    rows.push({ print: sym, braille: cells, grade: 1, category: "Punctuation",
      dotPattern: [...cells].map(brailleToDotPattern).join("+"), note: "" });
  }
  // Grade 1 — indicators
  const IND: [string, string, string][] = [
    ["Capital (letter)",  INDICATORS.CAPITAL_LETTER,  "dot 6"],
    ["Capital (word)",    INDICATORS.CAPITAL_WORD,    "dots 6,6"],
    ["Capital (passage)", INDICATORS.CAPITAL_PASSAGE, "dots 6,6,6"],
    ["Capital term",      INDICATORS.CAPITAL_TERM,    "⠠⠄"],
    ["Numeric indicator", INDICATORS.NUMERIC,         brailleToDotPattern(INDICATORS.NUMERIC)],
    ["Grade 1 (letter)",  INDICATORS.GRADE1_LETTER,   brailleToDotPattern(INDICATORS.GRADE1_LETTER)],
    ["Grade 1 (word)",    INDICATORS.GRADE1_WORD,     "⠰⠰"],
  ];
  for (const [name, cell, dots] of IND) {
    rows.push({ print: name, braille: cell, grade: 1, category: "Indicator",
      dotPattern: dots, note: "" });
  }
  // Grade 2 — contractions
  for (const c of ALL_CONTRACTIONS) {
    rows.push({
      print:      c.print,
      braille:    c.braille,
      grade:      2,
      category:   "Contraction",
      dotPattern: [...c.braille].map(brailleToDotPattern).join("+"),
      note:       c.note ?? c.type,
    });
  }
  return rows;
})();

const CATEGORIES = ["All", "Letter", "Digit", "Punctuation", "Indicator", "Contraction"];

export function ReferencePanel() {
  const [query,       setQuery]       = useState("");
  const [category,    setCategory]    = useState("All");
  const [gradeFilter, setGradeFilter] = useState<"All" | "1" | "2">("All");
  const [sortBy,      setSortBy]      = useState<"print" | "braille">("print");

  const filtered = useMemo(() => {
    let rows = ALL_ROWS;
    if (category !== "All")    rows = rows.filter((r) => r.category === category);
    if (gradeFilter !== "All") rows = rows.filter((r) => r.grade === Number(gradeFilter));
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.print.toLowerCase().includes(q) ||
          r.braille.includes(query) ||
          r.note.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) =>
      sortBy === "print" ? a.print.localeCompare(b.print) : a.braille.localeCompare(b.braille)
    );
  }, [query, category, gradeFilter, sortBy]);

  return (
    <section id="panel-reference" role="tabpanel" aria-labelledby="tab-reference" className="space-y-5">

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" aria-hidden />
          <input type="search" placeholder="Search print, braille, notes…"
            value={query} onChange={(e) => setQuery(e.target.value)}
            aria-label="Search reference table"
            className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-[#ddd] dark:border-[#333]
              bg-white dark:bg-[#1a1a1a]
              focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
        </div>
        {/* Grade filter */}
        <div className="flex gap-1" role="group" aria-label="Filter by grade">
          {(["All", "1", "2"] as const).map((g) => (
            <button key={g} onClick={() => setGradeFilter(g)} aria-pressed={gradeFilter === g}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors
                ${gradeFilter === g
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "border-[#ddd] dark:border-[#333] hover:bg-[#f0f0f0] dark:hover:bg-[#222]"}`}>
              {g === "All" ? "All grades" : `Grade ${g}`}
            </button>
          ))}
        </div>
        {/* Category filter */}
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by category">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} aria-pressed={category === cat}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors
                ${category === cat
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                  : "border-[#ddd] dark:border-[#333] hover:bg-[#f0f0f0] dark:hover:bg-[#222]"}`}>
              {cat}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "print" | "braille")}
          aria-label="Sort by"
          className="px-3 py-1.5 text-xs rounded-md border border-[#ddd] dark:border-[#333]
            bg-white dark:bg-[#1a1a1a]
            focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white">
          <option value="print">Sort: Print</option>
          <option value="braille">Sort: Braille</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#ddd] dark:border-[#333] overflow-auto">
        <table className="w-full text-sm border-collapse"
          aria-label={`UEB reference — ${filtered.length} results`}>
          <thead className="sticky top-0 bg-white dark:bg-[#1a1a1a] border-b border-[#ddd] dark:border-[#333]">
            <tr>
              {["PRINT", "BRAILLE", "GRADE", "DOTS", "CATEGORY", "NOTE"].map((h) => (
                <th key={h} scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-[#777] dark:text-[#777] tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={`${row.print}-${i}`}
                className="border-b border-[#f0f0f0] dark:border-[#222]
                  hover:bg-[#fafafa] dark:hover:bg-[#161616] transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs">{row.print}</td>
                <td className="px-4 py-2.5 braille-output text-xl leading-none">{row.braille}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${row.grade === 2 ? "badge-g2" : "badge-g1"}`}>
                    G{row.grade}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-[#777] dark:text-[#777] font-mono hidden md:table-cell">
                  {row.dotPattern}
                </td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 text-xs border border-[#ddd] dark:border-[#333] rounded-full">
                    {row.category}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-xs text-[#777] dark:text-[#777] hidden lg:table-cell">
                  {row.note}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-[#aaa] dark:text-[#555]">
                  No results for &ldquo;{query}&rdquo;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#aaa] dark:text-[#555]">
        {filtered.length} of {ALL_ROWS.length} entries · Grade 1 Uncontracted + Grade 2 Contracted UEB
      </p>
    </section>
  );
}
