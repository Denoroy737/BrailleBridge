/**
 * src/lib/braille/utils.ts
 * Shared utilities — validation, normalisation, string helpers.
 */

import { isBrailleChar, BRAILLE_SPACE } from "./mappings";

/** Split a string into individual Unicode code-point characters */
export function splitBrailleCells(input: string): string[] {
  return [...input];
}

/** NFC normalise and collapse common Unicode variants to ASCII equivalents */
export function normaliseText(text: string): string {
  return text
    .normalize("NFC")
    .replace(/[\u2018\u2019]/g, "'")   // smart single → straight
    .replace(/[\u201c\u201d]/g, '"')   // smart double → straight
    .replace(/\u2013/g, "-")           // en dash → hyphen
    .replace(/\u2014/g, "--");         // em dash → double-hyphen
}

/** Returns { valid, invalidChars } for a braille string */
export function validateBrailleInput(input: string): {
  valid: boolean;
  invalidChars: string[];
} {
  const invalid: string[] = [];
  for (const ch of input) {
    if (ch === "\n" || ch === "\r" || ch === " ") continue;
    if (!isBrailleChar(ch)) {
      if (!invalid.includes(ch)) invalid.push(ch);
    }
  }
  return { valid: invalid.length === 0, invalidChars: invalid };
}

/** Remove non-braille characters (keep braille cells + whitespace) */
export function filterToBraille(input: string): string {
  return [...input]
    .filter((ch) => isBrailleChar(ch) || ch === "\n" || ch === " " || ch === BRAILLE_SPACE)
    .join("");
}

/** Returns true if every letter character in `word` is uppercase */
export function isAllUpper(word: string): boolean {
  let hasLetter = false;
  for (const ch of word) {
    if (/[a-zA-Z]/.test(ch)) {
      hasLetter = true;
      if (ch !== ch.toUpperCase()) return false;
    }
  }
  return hasLetter;
}

/** Returns true if `ch` is an ASCII letter */
export function isLetter(ch: string): boolean {
  return /^[a-zA-Z]$/.test(ch);
}

/** Returns true if `ch` is a decimal digit */
export function isDigit(ch: string): boolean {
  return /^\d$/.test(ch);
}

/** URL-encode a string */
export function encodeForURL(text: string): string {
  return encodeURIComponent(text);
}

/** URL-decode a string, returning "" on error */
export function decodeFromURL(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return "";
  }
}

/** Truncate a string, appending "…" if needed */
export function truncate(s: string, maxLen = 80): string {
  return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + "\u2026";
}

/** Generate a short unique ID (for UI keys only, not cryptographic) */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
