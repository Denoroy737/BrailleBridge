"use client";
/**
 * src/components/EncoderPanel.tsx
 * English text → Braille. Supports Grade 1 (uncontracted) and Grade 2 (contracted).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Download, Trash2, Share2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { encodeToBraille }       from "@/lib/braille/encoder";
import { encodeToGrade2Braille } from "@/lib/braille/grade2/encoder2";
import { useAppStore }           from "@/store/useAppStore";
import { encodeForURL }          from "@/lib/braille/utils";
import { GradeToggle }           from "./GradeToggle";
import { BrailleVisualizer }     from "./BrailleVisualizer";

const DEBOUNCE_MS = 450;

export function EncoderPanel() {
  const [input,    setInput]    = useState("");
  const [output,   setOutput]   = useState("");
  const [busy,     setBusy]     = useState(false);
  const [selCell,  setSelCell]  = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { grade, addToHistory } = useAppStore();

  // ── Core conversion ──────────────────────────────────────────────────
  const convert = useCallback((text: string, g: 1 | 2) => {
    if (!text.trim()) { setOutput(""); return; }
    setBusy(true);
    try {
      const result = g === 2 ? encodeToGrade2Braille(text) : encodeToBraille(text);
      setOutput(result);
      addToHistory({ direction: "encode", grade: g, input: text, output: result });
    } catch (err) {
      console.error("[BrailleBridge] Encode error:", err);
      toast.error("Encoding failed — check your input.");
    } finally {
      setBusy(false);
    }
  }, [addToHistory]);

  // ── Debounced auto-convert on input/grade change ─────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => convert(input, grade), DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [input, grade, convert]);

  // ── Restore from URL query param ─────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("text");
    if (t) {
      try { setInput(decodeURIComponent(t)); } catch { /* ignore */ }
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Braille copied to clipboard.");
    } catch {
      toast.error("Clipboard access denied.");
    }
  };

  const handleDownload = (ext: "txt" | "brf") => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `braille.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as .${ext}`);
  };

  const handleShare = async () => {
    if (!input) return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab",  "encode");
    url.searchParams.set("text", encodeForURL(input));
    try {
      await navigator.clipboard.writeText(url.toString());
      toast.success("Share link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleClear = () => { setInput(""); setOutput(""); setSelCell(null); };

  // ── Stats ─────────────────────────────────────────────────────────────
  const charCount    = input.length;
  const brailleCount = [...output].filter((c) => c !== "\n" && c !== " " && c !== "\u2800").length;

  return (
    <section id="panel-encode" role="tabpanel" aria-labelledby="tab-encode" className="space-y-6">

      {/* Grade toggle + description */}
      <div className="flex flex-wrap items-start gap-4">
        <GradeToggle />
        <div className="flex-1 min-w-[200px] rounded-lg border border-[#ddd] dark:border-[#333]
          bg-[#fafafa] dark:bg-[#161616] px-4 py-3 text-xs text-[#555] dark:text-[#999] leading-relaxed">
          {grade === 1 ? (
            <><strong className="text-black dark:text-white">Grade 1 — Uncontracted.</strong>{" "}
            Every letter spelled out individually. No abbreviations.</>
          ) : (
            <><strong className="text-black dark:text-white">Grade 2 — Contracted.</strong>{" "}
            Common words and sequences compressed: <span className="braille-output text-base">⠮</span> = &ldquo;the&rdquo;,{" "}
            <span className="braille-output text-base">⠯</span> = &ldquo;and&rdquo;,{" "}
            <span className="braille-output text-base">⠹</span> = &ldquo;th&rdquo;, etc.</>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── Input ────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="encode-input" className="text-sm font-semibold">English Text</label>
            <span className="text-xs text-[#777] dark:text-[#777]" aria-live="polite">
              {charCount} chars
            </span>
          </div>
          <textarea
            id="encode-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste English text here…"
            rows={10}
            spellCheck
            autoComplete="off"
            className="w-full resize-y rounded-lg border border-[#ddd] dark:border-[#333]
              bg-white dark:bg-[#1a1a1a] px-4 py-3 text-sm font-mono leading-relaxed
              placeholder:text-[#bbb] dark:placeholder:text-[#555]
              focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white
              transition-colors"
            aria-label="Enter English text to encode into Braille"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => convert(input, grade)}
              disabled={!input.trim() || busy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                bg-black text-white dark:bg-white dark:text-black rounded-md
                disabled:opacity-40 hover:opacity-80 transition-opacity"
              aria-label="Convert now"
            >
              <RefreshCw size={12} className={busy ? "animate-spin" : ""} />
              Convert
            </button>
            <button onClick={handleClear} disabled={!input && !output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Trash2 size={12} /> Clear
            </button>
            <button onClick={handleShare} disabled={!input}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>

        {/* ── Output ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span id="braille-out-lbl" className="text-sm font-semibold flex items-center gap-2">
              Braille Output
              <span className={`text-xs px-1.5 py-0.5 rounded font-normal ${grade === 2 ? "badge-g2" : "badge-g1"}`}>
                Grade {grade}
              </span>
            </span>
            <span className="text-xs text-[#777] dark:text-[#777]" aria-live="polite">
              {brailleCount} cells
            </span>
          </div>
          <div
            role="region"
            aria-labelledby="braille-out-lbl"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-[240px] rounded-lg border border-[#ddd] dark:border-[#333]
              bg-[#fafafa] dark:bg-[#161616] px-4 py-3 braille-output overflow-auto"
          >
            {output
              ? output.split("\n").map((line, idx) => (
                  <div key={idx} className="min-h-[1.8em]">
                    {[...line].map((cell, ci) => (
                      <span
                        key={ci}
                        onClick={() => setSelCell(cell)}
                        title={`U+${(cell.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`}
                        aria-label={`Braille cell ${cell}`}
                        className={`cursor-pointer rounded transition-colors
                          ${selCell === cell
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "hover:bg-[#eee] dark:hover:bg-[#333]"}`}
                      >{cell}</span>
                    ))}
                  </div>
                ))
              : <span className="text-[#bbb] dark:text-[#555] text-base font-sans">
                  Braille output will appear here…
                </span>
            }
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy} disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Copy size={12} /> Copy
            </button>
            <button onClick={() => handleDownload("txt")} disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Download size={12} /> .txt
            </button>
            <button onClick={() => handleDownload("brf")} disabled={!output}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border
                border-[#ddd] dark:border-[#333] rounded-md hover:bg-[#f0f0f0]
                dark:hover:bg-[#222] disabled:opacity-40 transition-colors">
              <Download size={12} /> .brf
            </button>
          </div>
        </div>
      </div>

      {/* Cell visualizer (click any output cell to open) */}
      {selCell !== null && selCell !== "\u2800" && (
        <BrailleVisualizer cell={selCell} onClose={() => setSelCell(null)} />
      )}
    </section>
  );
}
