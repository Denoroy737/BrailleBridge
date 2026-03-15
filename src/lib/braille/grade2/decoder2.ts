/**
 * src/lib/braille/grade2/decoder2.ts
 *
 * Grade 2 UEB Decoder: contracted Braille → English text.
 *
 * Extends the Grade 1 decoder with contraction recognition:
 *  - Always contractions (ch, th, ing, the, …) — valid anywhere
 *  - Strong-word contractions (b=but, c=can, …) — only at word boundaries
 *  - Short-form abbreviations (⠩⠙=should, …) — only at word boundaries
 *
 * Grade-1 indicator (⠰) suppresses contraction matching for the next
 * cell(s), forcing literal Grade-1 interpretation.
 *
 * Decoder is robust: unknown cells are warned and skipped, never crash.
 */

import {
  INDICATORS, REVERSE_LETTER_MAP, REVERSE_DIGIT_MAP,
  REVERSE_PUNCTUATION_MAP, BRAILLE_SPACE, isBrailleChar,
} from "../mappings";
import { splitBrailleCells } from "../utils";
import type { DecodeResult } from "../decoder";
import {
  REVERSE_CONTRACTION_MAP, MAX_CONTRACTION_BRAILLE_LEN,
  STRONG_WORD_MAP,
} from "./contractions";

type CapitalMode = "none" | "letter" | "word" | "passage";

interface DecoderState {
  capitalMode:   CapitalMode;
  numericMode:   boolean;
  /** ⠰ — suppress contractions for the next letter cell */
  grade1Letter:  boolean;
  /** ⠰⠰ — suppress contractions for the rest of this word */
  grade1Word:    boolean;
}

function freshState(): DecoderState {
  return { capitalMode: "none", numericMode: false, grade1Letter: false, grade1Word: false };
}

function peekMultiIndicator(cells: string[], i: number): string | null {
  const c0 = cells[i]     ?? "";
  const c1 = cells[i + 1] ?? "";
  const c2 = cells[i + 2] ?? "";

  if (c0 === INDICATORS.CAPITAL_LETTER) {
    if (c1 === INDICATORS.CAPITAL_LETTER && c2 === INDICATORS.CAPITAL_LETTER) return INDICATORS.CAPITAL_PASSAGE;
    if (c1 === INDICATORS.CAPITAL_LETTER) return INDICATORS.CAPITAL_WORD;
    if (c1 === "\u2804")                  return INDICATORS.CAPITAL_TERM;
  }
  if (c0 === INDICATORS.GRADE1_LETTER) {
    if (c1 === INDICATORS.GRADE1_LETTER && c2 === INDICATORS.GRADE1_LETTER) return INDICATORS.GRADE1_PASSAGE;
    if (c1 === INDICATORS.GRADE1_LETTER) return INDICATORS.GRADE1_WORD;
    if (c1 === "\u2804")                 return INDICATORS.GRADE1_TERM;
  }
  return null;
}

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
 * Attempt to match the longest contraction starting at cells[i].
 * Returns { print, consumed } or null.
 * Skips matching if grade-1 mode is active.
 */
function matchContraction(
  cells: string[],
  i: number,
  grade1Active: boolean,
): { print: string; consumed: number } | null {
  if (grade1Active) return null;

  const maxLook = Math.min(MAX_CONTRACTION_BRAILLE_LEN, cells.length - i);
  for (let len = maxLook; len >= 1; len--) {
    const key = cells.slice(i, i + len).join("");
    const print = REVERSE_CONTRACTION_MAP.get(key);
    if (print !== undefined) {
      return { print, consumed: len };
    }
  }
  return null;
}

/**
 * Returns true if position i is at a word boundary (preceded and followed
 * by space or document edge), given `consumed` cells will be taken.
 */
function atWordBoundary(cells: string[], i: number, consumed: number): boolean {
  const before = i === 0
    ? true
    : (cells[i - 1] === BRAILLE_SPACE || cells[i - 1] === "\n");
  const after  = (i + consumed) >= cells.length
    ? true
    : (cells[i + consumed] === BRAILLE_SPACE || cells[i + consumed] === "\n");
  return before && after;
}

/**
 * Decode Grade 2 UEB Braille to English text.
 * @param braille - Unicode Braille string (contracted)
 * @returns DecodeResult with text and warnings
 */
export function decodeFromGrade2Braille(braille: string): DecodeResult {
  const warnings: string[] = [];
  const state = freshState();
  const cells = splitBrailleCells(braille);
  let text = "";
  let i = 0;

  while (i < cells.length) {
    const cell = cells[i];
    if (cell === undefined) break;

    // ── Whitespace ──────────────────────────────────────────────────────
    if (cell === "\n") {
      text += "\n";
      if (state.capitalMode === "word") state.capitalMode = "none";
      state.grade1Word = false;
      state.numericMode = false;
      i++; continue;
    }
    if (cell === BRAILLE_SPACE || cell === " ") {
      text += " ";
      if (state.capitalMode === "word") state.capitalMode = "none";
      state.grade1Word = false;
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
        case INDICATORS.CAPITAL_PASSAGE:
          state.capitalMode = "passage"; i += cellCount; break;
        case INDICATORS.CAPITAL_WORD:
          state.capitalMode = "word"; i += cellCount; break;
        case INDICATORS.CAPITAL_TERM:
          if (state.capitalMode !== "passage") {
            warnings.push(`Capital terminator (⠠⠄) at position ${i} without active passage mode.`);
          }
          state.capitalMode = "none"; i += cellCount; break;
        case INDICATORS.GRADE1_PASSAGE:
          state.grade1Letter = true; state.grade1Word = false; i += cellCount; break;
        case INDICATORS.GRADE1_WORD:
          state.grade1Word = true; state.grade1Letter = false; i += cellCount; break;
        case INDICATORS.GRADE1_TERM:
          state.grade1Letter = false; state.grade1Word = false; i += cellCount; break;
        default:
          i += cellCount; break;
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
      state.grade1Letter = true;
      i++; continue;
    }

    // ── Numeric mode ─────────────────────────────────────────────────────
    if (state.numericMode) {
      const digit = REVERSE_DIGIT_MAP[cell];
      if (digit !== undefined) {
        text += digit; i++; continue;
      }
      state.numericMode = false;
      warnings.push(`Non-digit cell in numeric mode at position ${i} — exiting.`);
      // fall through to normal cell handling
    }

    // ── Grade 2 contraction matching ─────────────────────────────────────
    const grade1Active = state.grade1Letter || state.grade1Word;
    const match = matchContraction(cells, i, grade1Active);

    if (match !== null) {
      const isStrongWord = STRONG_WORD_MAP.has(match.print);

      // Strong-word contractions are only valid at word boundaries
      if (!isStrongWord || atWordBoundary(cells, i, match.consumed)) {
        // Apply capitalisation to first letter of the match
        const firstChar = match.print[0] ?? "";
        const rest      = match.print.slice(1);
        text += applyCapital(firstChar, state) + rest;
        if (state.grade1Letter) state.grade1Letter = false;
        i += match.consumed;
        continue;
      }
      // Strong-word contraction not at boundary — fall through to letter decode
    }

    // ── Two-cell punctuation ──────────────────────────────────────────────
    const pair = cell + (cells[i + 1] ?? "");
    const pairPunct = REVERSE_PUNCTUATION_MAP[pair];
    if (pairPunct !== undefined) {
      text += pairPunct; i += 2; continue;
    }

    // ── Grade-1 letter decode ─────────────────────────────────────────────
    const letter = REVERSE_LETTER_MAP[cell];
    if (letter !== undefined) {
      text += applyCapital(letter, state);
      if (state.grade1Letter) state.grade1Letter = false;
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

  // End-of-input warnings
  if (state.capitalMode === "passage") {
    warnings.push("Unterminated capital passage mode (missing ⠠⠄ terminator).");
  }
  if (state.numericMode) {
    warnings.push("Input ended while in numeric mode — output may be incomplete.");
  }

  return { text, warnings };
}
