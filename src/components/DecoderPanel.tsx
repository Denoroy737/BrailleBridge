"use client";
/**
 * src/components/DecoderPanel.tsx
 * Braille → English. Supports Grade 1 and Grade 2.
 * Validates/filters input; shows decoder warnings panel.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Download, Trash2, AlertTriangle, BookOpen } from "lucide-react";
import { toast }                      from "sonner";
import { decodeFromBraille }          from "@/lib/braille/decoder";
import { decodeFromGrade2Braille }    from "@/lib/braille/grade2/decoder2";
import { validateBrailleInput, filterToBraille } from "@/lib/braille/utils";
import { useAppStore }                from "@/store/useAppStore";
import { GradeToggle }                from "./GradeToggle";

const DEBOUNCE_MS = 450;

interface Example { label: string; value: string; grade: 1 | 2 }
const EXAMPLES: Example[] = [
  { label: "Hello World (G1)", grade: 1,
    value: "\u2820\u2813\u2811\u2807\u2807\u2815\u2800\u2820\u283a\u2815\u2817\u2807\u2819" },
  { label: '"the and" (G2)',   grade: 2, value: "\u282e\u2800\u282f" },
  { label: "Numbers (G1)",     grade: 1, value: "\u283c\u2801\u2803\u2809\u2800\u283c\u281b\u281b" },
  { label: '"child" (G2)',     grade: 2, value: "\u2821" },
  { label: '"should" (G2)',    grade: 2, value: "\u2829\u2819" },
];

export function DecoderPanel() {
  const [brailleInput, setBrailleInput] = useState("");
  const [decoded,      setDecoded]      = useState("");
  const [warnings,     setWarnings]     = useState<string[]>([]);
  const [inputWarn,    setInputWarn]    = useState<string | null>(null);
  const [busy,         setBusy]         = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { grade, setGrade, addToHistory } = useAppStore();

  // ── Core decode ───────────────────────────────────────────────────────
  const runDecode = useCallback((b: string, g: 1 | 2) => {
    if (!b.trim()) { setDecoded(""); setWarnings([]); return; }
    setBusy(true);
    try {
      const { text, warnings: w } =
        g === 2 ? decodeFromGrade2Braille(b) : decodeFromBraille(b);
      setDecoded(text);
      setWarnings(w);
      if (w.length > 0) toast.warning(`${w.length} warning${w.length > 1 ? "s" : ""} during decode.`);
      addToHistory({ direction: "decode", grade: g, input: b, output: text, warnings: w });
    } catch (err) {
      console.error("[BrailleBridge] Decode error:", err);
      toast.error("Decoding failed unexpectedly.");
    } finally {
      setBusy(false);
    }
  }, [addToHistory]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runDecode(brailleInput, grade), DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [brailleInput, grade, runDecode]);

  // ── Input change with validation ──────────────────────────────────────
  const handleInput = (raw: string) => {
    const { valid, invalidChars } = validateBrailleInput(raw);
    if (!valid) {
      setInputWarn(`Removed non-Braille chars: ${invalidChars.map((c) => `"${c}"`).join(", ")}`);
      setBrailleInput(filterToBraille(raw));
    } else {
      setInputWarn(null);
      setBrailleInput(raw);
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!decoded) return;
    try { await navigator.clipboard.writeText(decoded); toast.success("Text copied."); }
    catch { toast.error("Clipboard access denied."); }
  };

  const handleDownload = () => {
    if (!decoded) return;
    const blob = new Blob([decoded], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "decoded.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setBrailleInput(""); setDecoded(""); setWarnings([]); setInputWarn(null);
  };

  const loadExample = (ex: Example) => {
    setGrade(ex.grade);
    setBrailleInput(ex.value);
    setInputWarn(null);
  };

  const cellCount = [...brailleInput].filter(
    (c) => c !== "\n" && c !== " " && c !== "\u2800"
  ).length;

  void busy; // decoded asynchronously; spinner is optional here

  return (
    <section id="panel-decode" role="tabpanel" aria-labelledby="tab-decode" className="space-y-6">

      {/* Grade toggle */}
      <div className="flex flex-wrap items-center gap-4">
        <GradeToggle />
        <p className="text-xs text-[#666] dark:text-[#999]">
          {grade === 2
            ? "Grade 2: contraction cells expanded to full words."
            : "Grade 1: each cell decoded to a single letter or symbol."}
        </p>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#777] dark:text-[#777] flex items-center gap-1">
          <BookOpen size={12} aria-hidden /> Examples:
        </span>
        {EXAMPLES.map((ex) => (
          <button key={ex.label} onClick={() => loadExample(ex)}
            className="px-2.5 py-1 text-xs border border-[#ddd] dark:border-[#333] rounded-md
              hover:bg-[#f0f0f0] dark:hover:bg-[#222] transition-colors">
            {ex.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Braille input ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="decode-input" className="text-sm font-semibold">Braille Input</label>
            <span className="text-xs text-[#777] dark:text-[#777]" aria-live="polite">
              {cellCount} cells
            </span>
          </div>
          <textarea
            id="decode-input"
            value={brailleInput}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Paste Braille Unicode here (⠁⠃⠉…)"
            rows={10}
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Braille Unicode to decode"
            aria-describedby={inputWarn !== null ? "decode-input-warn" : undefined}
            className="w-full resize-y rounded-lg border border-[#ddd] dark:border-[#333]
              bg-white dark:bg-[#1a1a1a] px-4 py-3 braille-output
              placeholder:text-[#bbb] dark:placeholder:text-[#555]
              placeholder:font-sans placeholder:text-sm
              focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
              transition-colors"
          />
          {inputWarn !== null && (
            <p id="decode-input-warn" role="alert"
              className="flex items-start gap-1.5 text-xs text-[#666] dark:text-[#999]">
              <AlertTriangle size={11} className="mt-0.5 shrink-0" aria-hidden />
              {inputWarn}
            </p>
          )}
          <button onClick={handleClear} disabled={!brailleInput && !decoded}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
              border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
              dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
            <Trash2 size={12} /> Clear
          </button>
        </div>

        {/* ── Decoded output ─────────────────────────────────────────────── */}
        <div className="space-y-2">
          <span id="decoded-out-lbl" className="text-sm font-semibold flex items-center gap-2">
            Decoded Text
            <span className={`text-xs px-1.5 py-0.5 rounded font-normal ${grade === 2 ? "badge-g2" : "badge-g1"}`}>
              Grade {grade}
            </span>
          </span>
          <div
            role="region"
            aria-labelledby="decoded-out-lbl"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-[240px] rounded-lg border border-[#ddd] dark:border-[#333]
              bg-[#fafafa] dark:bg-[#161616] px-4 py-3 text-sm font-mono
              leading-relaxed whitespace-pre-wrap overflow-auto"
          >
            {decoded
              ? decoded
              : <span className="text-[#bbb] dark:text-[#555]">Decoded text will appear here…</span>
            }
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} disabled={!decoded}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Copy size={12} /> Copy
            </button>
            <button onClick={handleDownload} disabled={!decoded}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Download size={12} /> Download
            </button>
          </div>
        </div>
      </div>

      {/* Warnings panel */}
      {warnings.length > 0 && (
        <div role="region" aria-label="Decoder warnings"
          className="rounded-lg border border-[#ddd] dark:border-[#333]
            bg-[#fafafa] dark:bg-[#161616] p-4 space-y-2">
          <h2 className="text-sm font-semibold flex items-center gap-1.5">
            <AlertTriangle size={13} aria-hidden />
            Decoder Warnings ({warnings.length})
          </h2>
          <ul className="space-y-1" role="list">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-[#555] dark:text-[#999] font-mono">
                {i + 1}. {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
