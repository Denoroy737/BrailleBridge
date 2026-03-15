/**
 * src/lib/braille/decoder.ts
 *
 * Grade 1 UEB Decoder: Unicode Braille → English text (uncontracted).
 *
 * Stateful tracking: capital modes (letter/word/passage), numeric mode,
 * grade-1 force indicator.
 *
 * Robust: unknown cells produce a warning and are skipped — never crashes.
 */

import {
  INDICATORS, REVERSE_LETTER_MAP, REVERSE_DIGIT_MAP,
  REVERSE_PUNCTUATION_MAP, BRAILLE_SPACE, isBrailleChar,
} from "./mappings";
import { splitBrailleCells } from "./utils";

export interface DecodeResult {
  text: string;
  warnings: string[];
}

type CapitalMode = "none" | "letter" | "word" | "passage";

interface DecoderState {
  capitalMode: CapitalMode;
  numericMode: boolean;
  grade1Mode: boolean; // ⠰ — next cell is Grade-1 literal
  pos: number;
}

function freshState(): DecoderState {
  return { capitalMode: "none", numericMode: false, grade1Mode: false, pos: 0 };
}

/**
 * Check for a multi-cell indicator starting at `cells[i]`.
 * Returns the indicator string or null.
 */
function peekMultiIndicator(cells: string[], i: number): string | null {
  const c0 = cells[i]     ?? "";
  const c1 = cells[i + 1] ?? "";
  const c2 = cells[i + 2] ?? "";

  if (c0 === INDICATORS.CAPITAL_LETTER) {
    if (c1 === INDICATORS.CAPITAL_LETTER && c2 === INDICATORS.CAPITAL_LETTER) return INDICATORS.CAPITAL_PASSAGE; // 3 cells
    if (c1 === INDICATORS.CAPITAL_LETTER) return INDICATORS.CAPITAL_WORD;  // 2 cells
    if (c1 === "\u2804")                  return INDICATORS.CAPITAL_TERM;  // 2 cells: ⠠⠄
  }
  if (c0 === INDICATORS.GRADE1_LETTER) {
    if (c1 === INDICATORS.GRADE1_LETTER && c2 === INDICATORS.GRADE1_LETTER) return INDICATORS.GRADE1_PASSAGE; // 3 cells
    if (c1 === INDICATORS.GRADE1_LETTER) return INDICATORS.GRADE1_WORD;   // 2 cells
    if (c1 === "\u2804")                 return INDICATORS.GRADE1_TERM;   // 2 cells: ⠰⠄
  }
  return null;
}

/** Apply capital indicator to a letter, advancing state */
function applyCapital(letter: string, state: DecoderState): string {
  switch (state.capitalMode) {
    case "letter":
      state.capitalMode = "none";
      return letter.toUpperCase();
    case "word":
    case "passage":
      return letter.toUpperCase();
    default:
      return letter;
  }
}

/**
 * Decode Grade 1 UEB Braille to English text.
 * @param braille - Unicode Braille string
 * @returns DecodeResult with text and any warnings
 */
export function decodeFromBraille(braille: string): DecodeResult {
  const warnings: string[] = [];
  const state = freshState();
  const cells = splitBrailleCells(braille);
  let text = "";
  let i = 0;

  while (i < cells.length) {
    const cell = cells[i];
    if (cell === undefined) break;
    state.pos = i;

    // ── Whitespace ──────────────────────────────────────────────────────
    if (cell === "\n") {
      text += "\n";
      if (state.capitalMode === "word") state.capitalMode = "none";
      state.numericMode = false;
      i++; continue;
    }
    if (cell === BRAILLE_SPACE || cell === " ") {
      text += " ";
      if (state.capitalMode === "word") state.capitalMode = "none";
      state.numericMode = false;
      i++; continue;
    }

    // ── Non-braille character ────────────────────────────────────────────
    if (!isBrailleChar(cell)) {
      if (cell.trim().length > 0) {
        const cp = cell.codePointAt(0)?.toString(16).toUpperCase() ?? "??";
        warnings.push(`Non-Braille character at position ${i}: U+${cp}`);
      }
      i++; continue;
    }

    // ── Multi-cell indicators ────────────────────────────────────────────
    const multi = peekMultiIndicator(cells, i);
    if (multi !== null) {
      const cellCount = [...multi].length;
      switch (multi) {
        case INDICATORS.CAPITAL_PASSAGE: state.capitalMode = "passage"; i += cellCount; break;
        case INDICATORS.CAPITAL_WORD:    state.capitalMode = "word";    i += cellCount; break;
        case INDICATORS.CAPITAL_TERM:
          if (state.capitalMode !== "passage") {
            warnings.push(`Capital terminator (⠠⠄) at position ${i} without active passage mode.`);
          }
          state.capitalMode = "none"; i += cellCount; break;
        case INDICATORS.GRADE1_PASSAGE:
        case INDICATORS.GRADE1_WORD:
          state.grade1Mode = true; i += cellCount; break;
        case INDICATORS.GRADE1_TERM:
          state.grade1Mode = false; i += cellCount; break;
        default: i += cellCount; break;
      }
      continue;
    }

    // ── Single-cell indicators ───────────────────────────────────────────
    if (cell === INDICATORS.CAPITAL_LETTER) {
      if (state.capitalMode === "none") state.capitalMode = "letter";
      i++; continue;
    }
    if (cell === INDICATORS.NUMERIC) {
      state.numericMode = true;
      state.capitalMode = "none";
      i++; continue;
    }
    if (cell === INDICATORS.GRADE1_LETTER) {
      state.grade1Mode = true;
      i++; continue;
    }

    // ── Numeric mode ─────────────────────────────────────────────────────
    if (state.numericMode) {
      const digit = REVERSE_DIGIT_MAP[cell];
      if (digit !== undefined) {
        text += digit; i++; continue;
      }
      // Non-digit cell exits numeric mode and falls through
      state.numericMode = false;
      warnings.push(`Non-digit cell in numeric mode at position ${i} — exiting numeric mode.`);
    }

    // ── Two-cell punctuation (try before single-cell) ────────────────────
    const pair = cell + (cells[i + 1] ?? "");
    const pairMatch = REVERSE_PUNCTUATION_MAP[pair];
    if (pairMatch !== undefined) {
      text += pairMatch; i += 2; continue;
    }

    // ── Letter ────────────────────────────────────────────────────────────
    const letter = REVERSE_LETTER_MAP[cell];
    if (letter !== undefined) {
      text += applyCapital(letter, state);
      state.grade1Mode = false;
      i++; continue;
    }

    // ── Single-cell punctuation ───────────────────────────────────────────
    const punct = REVERSE_PUNCTUATION_MAP[cell];
    if (punct !== undefined) {
      text += punct; i++; continue;
    }

    // ── Unknown cell ──────────────────────────────────────────────────────
    const cp = cell.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") ?? "????";
    warnings.push(`Unknown Braille cell at position ${i}: U+${cp} — skipped.`);
    i++;
  }

  // End-of-input mode warnings
  if (state.capitalMode === "passage") {
    warnings.push("Unterminated capital passage mode (missing ⠠⠄ terminator).");
  }
  if (state.numericMode) {
    warnings.push("Input ended while in numeric mode — output may be incomplete.");
  }

  return { text, warnings };
}
