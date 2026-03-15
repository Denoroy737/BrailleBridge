/**
 * src/lib/braille/grade2/encoder2.ts
 *
 * Grade 2 UEB Encoder: English text → contracted Braille.
 *
 * Priority order for each token (whole word):
 *   1. Short-form word  (e.g. "should" → ⠩⠙)
 *   2. Strong-word sign (e.g. "can"    → ⠉)
 *   3. Greedy char-by-char with always-contractions
 *      (e.g. "reading" → ⠗⠑⠁⠙⠬)
 *
 * Capital indicators applied the same as Grade 1:
 *   Single cap  → ⠠ before the first contracted cell
 *   All caps    → ⠠⠠ before the whole word
 *
 * Trailing terminal punctuation is stripped before contraction lookup
 * so "should." correctly encodes as ⠩⠙⠲ rather than char-by-char.
 */

import {
  LETTER_MAP, DIGIT_MAP, PUNCTUATION_MAP,
  BRAILLE_SPACE, INDICATORS,
} from "../mappings";
import { normaliseText, isLetter, isDigit, isAllUpper } from "../utils";
import {
  SHORT_FORM_MAP, STRONG_WORD_MAP, ALWAYS_MAP,
  MAX_CONTRACTION_PRINT_LEN,
} from "./contractions";

type CapClass = "lower" | "single" | "word";

interface EncodeState {
  numericMode: boolean;
}

// ── Capital helpers ────────────────────────────────────────────────────────

function classifyCapitals(letters: string[]): CapClass {
  if (letters.length === 0) return "lower";
  if (isAllUpper(letters.join(""))) {
    return letters.length === 1 ? "single" : "word";
  }
  const first = letters[0] ?? "";
  if (
    first !== first.toLowerCase() &&
    letters.slice(1).every((c) => c === c.toLowerCase())
  ) return "single";
  return "lower";
}

function wrapWithCapitals(braille: string, capClass: CapClass): string {
  if (capClass === "word")   return INDICATORS.CAPITAL_WORD   + braille;
  if (capClass === "single") return INDICATORS.CAPITAL_LETTER + braille;
  return braille;
}

// ── Punctuation helpers ────────────────────────────────────────────────────

/** Terminal punctuation characters that can be stripped for contraction lookup */
const TERMINAL_PUNCT_RE = /^(.*?)([.,!?;:)\]"'\u201d]*)$/s;

function splitTerminalPunct(token: string): { word: string; trail: string } {
  const m = TERMINAL_PUNCT_RE.exec(token);
  return { word: m?.[1] ?? token, trail: m?.[2] ?? "" };
}

/** Leading punctuation characters */
const LEADING_PUNCT_RE = /^(["'(\["\u201c]*)(.*?)$/s;

function splitLeadingPunct(token: string): { lead: string; rest: string } {
  const m = LEADING_PUNCT_RE.exec(token);
  return { lead: m?.[1] ?? "", rest: m?.[2] ?? token };
}

function encodePunctStr(punct: string, state: EncodeState): string {
  let out = "";
  for (const ch of punct) {
    if (state.numericMode) state.numericMode = false;
    const mapped = PUNCTUATION_MAP[ch];
    if (mapped !== undefined) out += mapped;
  }
  return out;
}

// ── Greedy always-contraction encoder ─────────────────────────────────────

/**
 * Encode a run of lowercase letters using greedy always-contractions.
 * Returns the braille string (no capital indicators applied here).
 */
function encodeLetterRun(lower: string): string {
  let out = "";
  let i = 0;
  while (i < lower.length) {
    let matched = false;
    const maxLen = Math.min(MAX_CONTRACTION_PRINT_LEN, lower.length - i);
    for (let len = maxLen; len >= 2; len--) {
      const slice = lower.slice(i, i + len);
      const cell = ALWAYS_MAP.get(slice);
      if (cell !== undefined) {
        out += cell;
        i += len;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const ch = lower[i] ?? "";
      out += LETTER_MAP[ch] ?? "";
      i++;
    }
  }
  return out;
}

// ── Token encoder ──────────────────────────────────────────────────────────

function encodeToken(token: string, state: EncodeState): string {
  // Split off leading and trailing punctuation
  const { lead, rest: afterLead } = splitLeadingPunct(token);
  const { word: purePart, trail } = splitTerminalPunct(afterLead);

  // Encode leading punctuation (no contractions apply here)
  let out = encodePunctStr(lead, state);

  if (purePart.length === 0) {
    // Token is entirely punctuation
    out += encodePunctStr(trail, state);
    return out;
  }

  const lowerWord = purePart.toLowerCase();
  const letterChars = [...purePart].filter(isLetter);
  const capClass = classifyCapitals(letterChars);

  // ── 1. Short-form lookup ────────────────────────────────────────────
  // Only apply if the pure part contains ONLY letters (no digits, no apostrophes)
  const isPureLetters = /^[a-zA-Z]+$/.test(purePart);
  if (isPureLetters) {
    const shortForm = SHORT_FORM_MAP.get(lowerWord);
    if (shortForm !== undefined) {
      out += wrapWithCapitals(shortForm, capClass);
      out += encodePunctStr(trail, state);
      return out;
    }

    // ── 2. Strong-word lookup ──────────────────────────────────────────
    const strongWord = STRONG_WORD_MAP.get(lowerWord);
    if (strongWord !== undefined) {
      out += wrapWithCapitals(strongWord, capClass);
      out += encodePunctStr(trail, state);
      return out;
    }
  }

  // ── 3. Char-by-char with always-contractions ────────────────────────
  // Prepend word-level capital indicator once
  if (capClass === "word") out += INDICATORS.CAPITAL_WORD;

  let i = 0;
  const firstLetIdx = purePart.search(/[a-zA-Z]/);

  while (i < purePart.length) {
    const ch = purePart[i] ?? "";

    if (isDigit(ch)) {
      if (state.numericMode) {
        // Continue numeric mode
      } else {
        out += INDICATORS.NUMERIC;
        state.numericMode = true;
      }
      out += DIGIT_MAP[ch] ?? "";
      i++;
      continue;
    }

    if (state.numericMode) state.numericMode = false;

    if (isLetter(ch)) {
      // Gather contiguous letter run
      let runStart = i;
      let run = "";
      while (i < purePart.length && isLetter(purePart[i] ?? "")) {
        run += purePart[i] ?? "";
        i++;
      }

      // Encode the run (already lowercase internally in encodeLetterRun)
      const encoded = encodeLetterRun(run.toLowerCase());

      // Apply capital indicator for this run if needed
      if (capClass === "single" && runStart === firstLetIdx) {
        out += INDICATORS.CAPITAL_LETTER + encoded;
      } else if (capClass === "lower") {
        // Stray uppercase at start of run
        if ((run[0] ?? "") !== (run[0] ?? "").toLowerCase()) {
          out += INDICATORS.CAPITAL_LETTER + encoded;
        } else {
          out += encoded;
        }
      } else {
        // "word" capClass — indicator already prepended
        out += encoded;
      }
      void runStart; // consumed via closure
      continue;
    }

    // Punctuation
    const mapped = PUNCTUATION_MAP[ch];
    if (mapped !== undefined) out += mapped;
    i++;
  }

  out += encodePunctStr(trail, state);
  return out;
}

// ── Public entry point ─────────────────────────────────────────────────────

/**
 * Encode English text to Grade 2 UEB Braille (contracted).
 * @param text  Raw English input
 * @returns     Contracted Unicode Braille string
 */
export function encodeToGrade2Braille(text: string): string {
  const src = normaliseText(text);
  const state: EncodeState = { numericMode: false };
  let out = "";
  let i = 0;

  while (i < src.length) {
    const ch = src[i] ?? "";

    if (ch === "\n")  { out += "\n"; state.numericMode = false; i++; continue; }
    if (ch === "\r")  { i++; continue; }
    if (ch === " ")   { out += BRAILLE_SPACE; state.numericMode = false; i++; continue; }

    // Gather non-space token
    let token = "";
    while (i < src.length) {
      const c = src[i];
      if (c === " " || c === "\n" || c === "\r") break;
      token += c ?? "";
      i++;
    }
    out += encodeToken(token, state);
  }

  return out;
}
