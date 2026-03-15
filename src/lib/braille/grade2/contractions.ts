/**
 * src/lib/braille/grade2/contractions.ts
 *
 * UEB Grade 2 contraction table.
 *
 * Three categories included (in decreasing priority for encoder):
 *   1. SHORT_FORMS       — abbreviated spellings, whole-word only
 *   2. STRONG_WORD       — single/multi-cell word signs, whole-word only
 *   3. ALWAYS            — letter-combination signs, valid anywhere in a word
 *
 * Initial-letter and final-letter contractions are intentionally omitted in
 * this version to avoid decoder ambiguity with punctuation cells that share
 * the same Braille patterns (dots-2, dots-2,3, dots-2,5, dots-2,5,6).
 *
 * Reference: ICEB UEB Rulebook (2013 rev. 2016)
 * https://www.iceb.org/ueb.html
 */

export interface Contraction {
  print:   string; // lowercase English
  braille: string; // Unicode Braille cell(s)
  type:    "always" | "strong_word" | "short_form";
  note?:   string | undefined;
}

// ── Always contractions (valid anywhere in a word) ───────────────────────
// These are single Braille cells that represent common letter combinations.
// They are ALWAYS used wherever the sequence appears.

export const ALWAYS_CONTRACTIONS: readonly Contraction[] = [
  // 4-letter sequences (longest first for greedy matching)
  { print: "with", braille: "\u283e", type: "always", note: "⠾ dots 2,3,4,5,6" },
  // 3-letter sequences
  { print: "and",  braille: "\u282f", type: "always", note: "⠯ dots 1,2,3,4,6" },
  { print: "for",  braille: "\u283f", type: "always", note: "⠿ dots 1,2,3,4,5,6" },
  { print: "the",  braille: "\u282e", type: "always", note: "⠮ dots 2,3,4,6" },
  { print: "ing",  braille: "\u282c", type: "always", note: "⠬ dots 3,4,6" },
  { print: "ble",  braille: "\u2834", type: "always", note: "⠴ dots 3,5,6" },
  { print: "ous",  braille: "\u282b", type: "always", note: "⠫ dots 1,2,4,6 — same cell as 'ed' sign; using ⠫" },
  // 2-letter sequences
  { print: "ch",   braille: "\u2821", type: "always", note: "⠡ dots 1,6" },
  { print: "gh",   braille: "\u2823", type: "always", note: "⠣ dots 1,2,6" },
  { print: "sh",   braille: "\u2829", type: "always", note: "⠩ dots 1,4,6" },
  { print: "th",   braille: "\u2839", type: "always", note: "⠹ dots 1,4,5,6" },
  { print: "wh",   braille: "\u2831", type: "always", note: "⠱ dots 1,5,6" },
  { print: "ed",   braille: "\u282b", type: "always", note: "⠫ dots 1,2,4,6" },
  { print: "er",   braille: "\u283b", type: "always", note: "⠻ dots 1,2,4,5,6" },
  { print: "ou",   braille: "\u2833", type: "always", note: "⠳ dots 1,2,5,6" },
  { print: "ow",   braille: "\u282a", type: "always", note: "⠪ dots 2,4,6" },
  { print: "ar",   braille: "\u281c", type: "always", note: "⠜ dots 3,4,5" },
  { print: "of",   braille: "\u2837", type: "always", note: "⠷ dots 1,2,3,5,6" },
  { print: "st",   braille: "\u280c", type: "always", note: "⠌ dots 3,4" },
];

// ── Strong-word contractions (whole-word only) ────────────────────────────
// Each of these is a single cell. They are ONLY used when the word stands
// alone (preceded and followed by a space or document boundary).

export const STRONG_WORD_CONTRACTIONS: readonly Contraction[] = [
  // Letter-sign word contractions
  { print: "but",       braille: "\u2803", type: "strong_word", note: "= b" },
  { print: "can",       braille: "\u2809", type: "strong_word", note: "= c" },
  { print: "do",        braille: "\u2819", type: "strong_word", note: "= d" },
  { print: "every",     braille: "\u2811", type: "strong_word", note: "= e" },
  { print: "from",      braille: "\u280b", type: "strong_word", note: "= f" },
  { print: "go",        braille: "\u281b", type: "strong_word", note: "= g" },
  { print: "have",      braille: "\u2813", type: "strong_word", note: "= h" },
  { print: "just",      braille: "\u281a", type: "strong_word", note: "= j" },
  { print: "knowledge", braille: "\u2805", type: "strong_word", note: "= k" },
  { print: "like",      braille: "\u2807", type: "strong_word", note: "= l" },
  { print: "more",      braille: "\u280d", type: "strong_word", note: "= m" },
  { print: "not",       braille: "\u281d", type: "strong_word", note: "= n" },
  { print: "people",    braille: "\u280f", type: "strong_word", note: "= p" },
  { print: "quite",     braille: "\u281f", type: "strong_word", note: "= q" },
  { print: "rather",    braille: "\u2817", type: "strong_word", note: "= r" },
  { print: "so",        braille: "\u280e", type: "strong_word", note: "= s" },
  { print: "that",      braille: "\u281e", type: "strong_word", note: "= t" },
  { print: "us",        braille: "\u2825", type: "strong_word", note: "= u" },
  { print: "very",      braille: "\u2827", type: "strong_word", note: "= v" },
  { print: "will",      braille: "\u283a", type: "strong_word", note: "= w" },
  { print: "it",        braille: "\u282d", type: "strong_word", note: "= x" },
  { print: "you",       braille: "\u283d", type: "strong_word", note: "= y" },
  { print: "as",        braille: "\u2835", type: "strong_word", note: "= z" },
  // Digraph-sign word contractions
  { print: "child",  braille: "\u2821", type: "strong_word", note: "= ch sign" },
  { print: "shall",  braille: "\u2829", type: "strong_word", note: "= sh sign" },
  { print: "this",   braille: "\u2839", type: "strong_word", note: "= th sign" },
  { print: "which",  braille: "\u2831", type: "strong_word", note: "= wh sign" },
  { print: "out",    braille: "\u2833", type: "strong_word", note: "= ou sign" },
  { print: "still",  braille: "\u280c", type: "strong_word", note: "= st sign" },
];

// ── Short-form words (abbreviated spellings, whole-word only) ─────────────
// Multi-cell abbreviations. Each cell in the braille value is a letter/sign
// from the Grade-1 alphabet.

export const SHORT_FORMS: readonly Contraction[] = [
  { print: "about",      braille: "\u2801\u2803",             type: "short_form" },
  { print: "according",  braille: "\u2801\u2809",             type: "short_form" },
  { print: "after",      braille: "\u2801\u280b",             type: "short_form" },
  { print: "afternoon",  braille: "\u2801\u280b\u281d",       type: "short_form" },
  { print: "afterward",  braille: "\u2801\u280b\u283a",       type: "short_form" },
  { print: "again",      braille: "\u2801\u281b",             type: "short_form" },
  { print: "against",    braille: "\u2801\u281b\u280c",       type: "short_form" },
  { print: "already",    braille: "\u2801\u2807\u2817",       type: "short_form" },
  { print: "also",       braille: "\u2801\u2807",             type: "short_form" },
  { print: "although",   braille: "\u2801\u2807\u2839",       type: "short_form" },
  { print: "altogether", braille: "\u2801\u2807\u281e",       type: "short_form" },
  { print: "always",     braille: "\u2801\u2807\u283a",       type: "short_form" },
  { print: "because",    braille: "\u2803\u2809",             type: "short_form" },
  { print: "before",     braille: "\u2803\u280b",             type: "short_form" },
  { print: "behind",     braille: "\u2803\u2813",             type: "short_form" },
  { print: "below",      braille: "\u2803\u2807",             type: "short_form" },
  { print: "beneath",    braille: "\u2803\u281d",             type: "short_form" },
  { print: "beside",     braille: "\u2803\u280e",             type: "short_form" },
  { print: "between",    braille: "\u2803\u281e",             type: "short_form" },
  { print: "beyond",     braille: "\u2803\u283d",             type: "short_form" },
  { print: "braille",    braille: "\u2803\u2817\u2807",       type: "short_form" },
  { print: "children",   braille: "\u2821\u281d",             type: "short_form" },
  { print: "could",      braille: "\u2809\u2819",             type: "short_form" },
  { print: "friend",     braille: "\u280b\u281d",             type: "short_form" },
  { print: "good",       braille: "\u281b\u2819",             type: "short_form" },
  { print: "great",      braille: "\u281b\u2817",             type: "short_form" },
  { print: "him",        braille: "\u2813\u280d",             type: "short_form" },
  { print: "his",        braille: "\u2813\u280a",             type: "short_form" },
  { print: "immediate",  braille: "\u280a\u280d",             type: "short_form" },
  { print: "its",        braille: "\u282d\u280e",             type: "short_form" },
  { print: "letter",     braille: "\u2807\u2817",             type: "short_form" },
  { print: "little",     braille: "\u2807\u2807",             type: "short_form" },
  { print: "much",       braille: "\u280d\u2821",             type: "short_form" },
  { print: "must",       braille: "\u280d\u280c",             type: "short_form" },
  { print: "necessary",  braille: "\u281d\u2811\u2809",       type: "short_form" },
  { print: "neither",    braille: "\u281d\u2811\u280a",       type: "short_form" },
  { print: "never",      braille: "\u281d\u2827",             type: "short_form" },
  { print: "paid",       braille: "\u280f\u2819",             type: "short_form" },
  { print: "perhaps",    braille: "\u280f\u2817\u2813",       type: "short_form" },
  { print: "quick",      braille: "\u281f\u2805",             type: "short_form" },
  { print: "said",       braille: "\u280e\u2819",             type: "short_form" },
  { print: "should",     braille: "\u2829\u2819",             type: "short_form" },
  { print: "such",       braille: "\u280e\u2821",             type: "short_form" },
  { print: "today",      braille: "\u281e\u2819",             type: "short_form" },
  { print: "together",   braille: "\u281e\u281b\u2817",       type: "short_form" },
  { print: "tomorrow",   braille: "\u281e\u280d",             type: "short_form" },
  { print: "tonight",    braille: "\u281e\u281d\u281b",       type: "short_form" },
  { print: "upon",       braille: "\u2825\u280f",             type: "short_form" },
  { print: "word",       braille: "\u283a\u2819",             type: "short_form" },
  { print: "would",      braille: "\u283a\u2819",             type: "short_form" }, // same braille as "word"
  { print: "your",       braille: "\u283d\u2817",             type: "short_form" },
];

// ── Combined lookup maps ──────────────────────────────────────────────────

/** All contractions sorted by print-string length descending (greedy encoder) */
export const ALL_CONTRACTIONS: readonly Contraction[] = [
  ...SHORT_FORMS,
  ...STRONG_WORD_CONTRACTIONS,
  ...ALWAYS_CONTRACTIONS,
].sort((a, b) => b.print.length - a.print.length);

/** Short-form lookup: lowercase print word → braille */
export const SHORT_FORM_MAP: ReadonlyMap<string, string> = new Map(
  SHORT_FORMS.map((c) => [c.print, c.braille] as [string, string])
);

/** Strong-word lookup: lowercase print word → braille */
export const STRONG_WORD_MAP: ReadonlyMap<string, string> = new Map(
  STRONG_WORD_CONTRACTIONS.map((c) => [c.print, c.braille] as [string, string])
);

/**
 * Always-contraction map: print sequence → braille.
 * Sorted by print length descending so a simple iteration gives greedy match.
 */
export const ALWAYS_MAP: ReadonlyMap<string, string> = new Map(
  [...ALWAYS_CONTRACTIONS]
    .sort((a, b) => b.print.length - a.print.length)
    .map((c) => [c.print, c.braille] as [string, string])
);

/** Maximum print-string length across all contractions */
export const MAX_CONTRACTION_PRINT_LEN: number = Math.max(
  ...ALL_CONTRACTIONS.map((c) => c.print.length)
);

/**
 * Reverse map: braille string → print word.
 * Built from ALL_CONTRACTIONS; longer braille sequences take priority.
 */
export const REVERSE_CONTRACTION_MAP: ReadonlyMap<string, string> = (() => {
  const sorted = [...ALL_CONTRACTIONS].sort(
    (a, b) => b.braille.length - a.braille.length
  );
  const m = new Map<string, string>();
  for (const { print, braille } of sorted) {
    if (!m.has(braille)) m.set(braille, print);
  }
  return m;
})();

/** Maximum braille cell count across all contractions */
export const MAX_CONTRACTION_BRAILLE_LEN: number = Math.max(
  ...[...REVERSE_CONTRACTION_MAP.keys()].map((k) => [...k].length)
);
