/**
 * src/lib/braille/mappings.ts
 *
 * Unified English Braille (UEB) Grade 1 mappings.
 * Unicode Braille Patterns U+2800–U+28FF.
 *
 * Dot-to-bit mapping (standard UEB / ISO 11548):
 *   bit 0 = dot 1   bit 3 = dot 4
 *   bit 1 = dot 2   bit 4 = dot 5
 *   bit 2 = dot 3   bit 5 = dot 6
 *
 * Reference: https://www.iceb.org/ueb.html
 */

export type BrailleCell = string; // exactly one U+28xx code-point

// ── Indicators ───────────────────────────────────────────────────────────

export const INDICATORS = {
  /** ⠠ — capital letter indicator (next letter only) */
  CAPITAL_LETTER:  "\u2820",
  /** ⠠⠠ — capital word indicator */
  CAPITAL_WORD:    "\u2820\u2820",
  /** ⠠⠠⠠ — capital passage indicator */
  CAPITAL_PASSAGE: "\u2820\u2820\u2820",
  /** ⠠⠄ — capital passage terminator */
  CAPITAL_TERM:    "\u2820\u2804",
  /** ⠼ — numeric mode indicator (U+283C, dots 3,4,5,6) */
  NUMERIC:         "\u283c",
  /** ⠰ — grade 1 symbol indicator */
  GRADE1_LETTER:   "\u2830",
  /** ⠰⠰ — grade 1 word indicator */
  GRADE1_WORD:     "\u2830\u2830",
  /** ⠰⠰⠰ — grade 1 passage indicator */
  GRADE1_PASSAGE:  "\u2830\u2830\u2830",
  /** ⠰⠄ — grade 1 passage terminator */
  GRADE1_TERM:     "\u2830\u2804",
} as const;

// ── Letters a–z ──────────────────────────────────────────────────────────

export const LETTER_MAP: Readonly<Record<string, BrailleCell>> = {
  a: "\u2801", // ⠁  dots 1
  b: "\u2803", // ⠃  dots 1,2
  c: "\u2809", // ⠉  dots 1,4
  d: "\u2819", // ⠙  dots 1,4,5
  e: "\u2811", // ⠑  dots 1,5
  f: "\u280b", // ⠋  dots 1,2,4
  g: "\u281b", // ⠛  dots 1,2,4,5
  h: "\u2813", // ⠓  dots 1,2,5
  i: "\u280a", // ⠊  dots 2,4
  j: "\u281a", // ⠚  dots 2,4,5
  k: "\u2805", // ⠅  dots 1,3
  l: "\u2807", // ⠇  dots 1,2,3
  m: "\u280d", // ⠍  dots 1,3,4
  n: "\u281d", // ⠝  dots 1,3,4,5
  o: "\u2815", // ⠕  dots 1,3,5
  p: "\u280f", // ⠏  dots 1,2,3,4
  q: "\u281f", // ⠟  dots 1,2,3,4,5
  r: "\u2817", // ⠗  dots 1,2,3,5
  s: "\u280e", // ⠎  dots 2,3,4
  t: "\u281e", // ⠞  dots 2,3,4,5
  u: "\u2825", // ⠥  dots 1,3,6
  v: "\u2827", // ⠧  dots 1,2,3,6
  w: "\u283a", // ⠺  dots 2,4,5,6
  x: "\u282d", // ⠭  dots 1,3,4,6
  y: "\u283d", // ⠽  dots 1,3,4,5,6
  z: "\u2835", // ⠵  dots 1,3,5,6
};

// ── Digits 1–9, 0 (overlap with a–j in numeric mode) ────────────────────

export const DIGIT_MAP: Readonly<Record<string, BrailleCell>> = {
  "1": "\u2801", // = a
  "2": "\u2803", // = b
  "3": "\u2809", // = c
  "4": "\u2819", // = d
  "5": "\u2811", // = e
  "6": "\u280b", // = f
  "7": "\u281b", // = g
  "8": "\u2813", // = h
  "9": "\u280a", // = i
  "0": "\u281a", // = j
};

export const REVERSE_DIGIT_MAP: Readonly<Record<BrailleCell, string>> =
  Object.fromEntries(Object.entries(DIGIT_MAP).map(([k, v]) => [v, k] as [string, string]));

// ── Punctuation (print → braille) ────────────────────────────────────────

export const PUNCTUATION_MAP: Readonly<Record<string, string>> = {
  ",":      "\u2802", // ⠂  dots 2
  ";":      "\u2806", // ⠆  dots 2,3
  ":":      "\u2812", // ⠒  dots 2,5
  ".":      "\u2832", // ⠲  dots 2,5,6
  "!":      "\u2816", // ⠖  dots 2,3,5
  "?":      "\u2826", // ⠦  dots 2,3,5,6 — wait: 0x26=38=0b100110= bits1,2,5=dots2,3,6. Let me recompute.
  // 0x26 = 0b00100110 = bits 1,2,5 = dots 2,3,6. Hmm that's not right for ?.
  // UEB ? = ⠦ = dots 2,3,5,6. 0x26 = bits 1,2,5 = dots 2,3,6. That's only 3 dots.
  // dots 2,3,5,6 = bits 1,2,4,5 = 0b110110 = 0x36 = U+2836.
  // Let me correct: ? = ⠦... actually ⠦ is U+2826 = 0x26 = 0b100110 = bits1,2,5 = dots 2,3,6.
  // But UEB question mark IS U+2826 ⠦. So ? = dots 2,3,6.
  // I had the wrong dot description but the codepoint is right.
  "'":      "\u2804", // ⠄  dot 3
  "\u2018": "\u2804", // ' left single quote → ⠄
  "\u2019": "\u2804", // ' right single quote → ⠄
  "-":      "\u2824", // ⠤  dots 3,6
  "\u2013": "\u2824", // – en dash → ⠤
  "\u2014": "\u2824\u2824", // — em dash → ⠤⠤
  "\"":     "\u2826", // opening double quote → same as ?; decoder uses context
  "\u201c": "\u2826", // " → ⠦
  "\u201d": "\u2834", // " → ⠴ U+2834 = dots 3,5,6
  "(":      "\u2810\u2823", // ⠐⠣  dots 5 + dots 1,2,6
  ")":      "\u2810\u281c", // ⠐⠜  dots 5 + dots 3,4,5
  "[":      "\u2810\u2837", // ⠐⠷  dots 5 + dots 1,2,3,5,6
  "]":      "\u2810\u283e", // ⠐⠾  dots 5 + dots 2,3,4,5,6
  "/":      "\u2838\u280c", // ⠸⠌  dots 4,5,6 + dots 3,4
  "@":      "\u2820\u2801", // ⠠⠁
  "*":      "\u2810\u2801", // ⠐⠁
  "&":      "\u2810\u280f", // ⠐⠏
  "%":      "\u2810\u2814", // ⠐⠔  U+2814 = dots 3,4,5
  "+":      "\u2810\u2816", // ⠐⠖
  "=":      "\u2810\u2832", // ⠐⠲
};

/** U+2800 — blank braille cell (used as space) */
export const BRAILLE_SPACE = "\u2800";

// ── Reverse maps (braille → print) ───────────────────────────────────────

export const REVERSE_LETTER_MAP: Readonly<Record<BrailleCell, string>> =
  Object.fromEntries(Object.entries(LETTER_MAP).map(([k, v]) => [v, k] as [string, string]));

/**
 * Reverse punctuation map.
 * Two-cell entries MUST be checked before single-cell entries in the decoder.
 */
export const REVERSE_PUNCTUATION_MAP: Readonly<Record<string, string>> = {
  // Two-cell (must be tried first in decoder)
  "\u2810\u2823": "(",
  "\u2810\u281c": ")",
  "\u2810\u2837": "[",
  "\u2810\u283e": "]",
  "\u2838\u280c": "/",
  "\u2810\u2801": "*",
  "\u2810\u280f": "&",
  "\u2810\u2814": "%",
  "\u2810\u2816": "+",
  "\u2810\u2832": "=",
  "\u2824\u2824": "\u2014", // em dash
  // Single-cell
  "\u2802": ",",
  "\u2806": ";",
  "\u2812": ":",
  "\u2832": ".",
  "\u2816": "!",
  "\u2826": "?",
  "\u2804": "'",
  "\u2834": "\u201d",
  "\u2824": "-",
};

// ── Braille cell utilities ────────────────────────────────────────────────

/** Returns true if the character is a Unicode Braille Pattern (U+2800–U+28FF) */
export function isBrailleChar(ch: string): boolean {
  const cp = ch.codePointAt(0);
  return cp !== undefined && cp >= 0x2800 && cp <= 0x28ff;
}

/**
 * Returns the dot pattern string for a braille cell.
 * Example: ⠃ (U+2803) → "12"
 */
export function brailleToDotPattern(cell: BrailleCell): string {
  const cp = cell.codePointAt(0);
  if (cp === undefined || cp < 0x2800 || cp > 0x28ff) return "";
  const bits = cp - 0x2800;
  const dots: number[] = [];
  for (let d = 0; d < 8; d++) {
    if (bits & (1 << d)) dots.push(d + 1);
  }
  return dots.join("");
}

/**
 * Builds a braille cell from a dot pattern string.
 * Example: "12" → ⠃ (U+2803)
 */
export function dotPatternToBraille(dots: string): BrailleCell {
  let bits = 0;
  for (const ch of dots) {
    const d = parseInt(ch, 10);
    if (d >= 1 && d <= 8) bits |= 1 << (d - 1);
  }
  return String.fromCodePoint(0x2800 + bits);
}
