/**
 * src/lib/braille/encoder.ts
 *
 * Grade 1 UEB Encoder: English text → Unicode Braille (uncontracted).
 *
 * Capital rules:
 *   Single capital letter      → ⠠ before cell
 *   All-caps word (≥2 letters) → ⠠⠠ before word
 *
 * Numeric mode: digit run preceded by ⠼, ends at space / letter / most punctuation.
 * Spaces and newlines are preserved exactly.
 */

import {
  LETTER_MAP, DIGIT_MAP, PUNCTUATION_MAP,
  BRAILLE_SPACE, INDICATORS,
} from "./mappings";
import { normaliseText, isLetter, isDigit, isAllUpper } from "./utils";

type CapClass = "lower" | "single" | "word";

interface TokenEncodeState {
  numericMode: boolean;
}

/** Determine the capitalisation class of a token */
function classifyCapitals(token: string): CapClass {
  const letters = [...token].filter(isLetter);
  if (letters.length === 0) return "lower";
  if (isAllUpper(token)) {
    return letters.length === 1 ? "single" : "word";
  }
  // Title-case: first letter upper, rest lower
  const first = letters[0] ?? "";
  if (
    first === first.toUpperCase() &&
    first !== first.toLowerCase() &&
    letters.slice(1).every((c) => c === c.toLowerCase())
  ) {
    return "single";
  }
  return "lower";
}

/** Index of the first letter character in `token` */
function firstLetterIdx(token: string): number {
  for (let i = 0; i < token.length; i++) {
    if (isLetter(token[i] ?? "")) return i;
  }
  return -1;
}

/** Encode a single non-space token */
function encodeToken(token: string, state: TokenEncodeState): string {
  const capClass = classifyCapitals(token);
  const firstIdx = firstLetterIdx(token);
  let out = "";

  // Prepend word-level capital indicator
  if (capClass === "word") out += INDICATORS.CAPITAL_WORD;

  for (let i = 0; i < token.length; i++) {
    const ch = token[i] ?? "";

    if (isLetter(ch)) {
      if (state.numericMode) state.numericMode = false;

      const cell = LETTER_MAP[ch.toLowerCase()] ?? "";

      // Determine if this specific letter needs a capital indicator
      let needsCap = false;
      if (capClass === "lower") {
        // Stray uppercase letter inside an otherwise-lowercase token
        needsCap = ch !== ch.toLowerCase();
      } else if (capClass === "single") {
        // Only the first letter gets ⠠
        needsCap = i === firstIdx;
      }
      // capClass === "word" already has ⠠⠠ prepended — no per-letter indicator

      out += needsCap ? INDICATORS.CAPITAL_LETTER + cell : cell;
      continue;
    }

    if (isDigit(ch)) {
      if (!state.numericMode) {
        out += INDICATORS.NUMERIC;
        state.numericMode = true;
      }
      out += DIGIT_MAP[ch] ?? "";
      continue;
    }

    // Punctuation / symbol
    if (state.numericMode) state.numericMode = false;
    const mapped = PUNCTUATION_MAP[ch];
    if (mapped !== undefined) out += mapped;
    // Unknown characters are silently skipped (Grade 1 spec: never crash)
  }

  return out;
}

/**
 * Encode English text to Grade 1 UEB Braille.
 * @param text - Raw English input
 * @returns Unicode Braille string
 */
export function encodeToBraille(text: string): string {
  const src = normaliseText(text);
  const state: TokenEncodeState = { numericMode: false };
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
