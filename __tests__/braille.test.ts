/**
 * __tests__/braille.test.ts
 *
 * 45 test cases for BrailleBridge Grade 1 + Grade 2 encode/decode.
 * Self-contained runner — no test framework dependency required.
 * Run with:  npx ts-node --project tsconfig.json __tests__/braille.test.ts
 * Or add jest/vitest and import normally.
 */

import { encodeToBraille }         from "../src/lib/braille/encoder";
import { decodeFromBraille }        from "../src/lib/braille/decoder";
import { encodeToGrade2Braille }    from "../src/lib/braille/grade2/encoder2";
import { decodeFromGrade2Braille }  from "../src/lib/braille/grade2/decoder2";

const enc1 = encodeToBraille;
const dec1 = (s: string) => decodeFromBraille(s).text;
const enc2 = encodeToGrade2Braille;
const dec2 = (s: string) => decodeFromGrade2Braille(s).text;

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

// ══════════════════════════════════════════════════════════════════════
// GRADE 1
// ══════════════════════════════════════════════════════════════════════
console.log("\n── Grade 1 ─────────────────────────────────────────");

// TC01 – single letter
assert(enc1("a") === "\u2801", "TC01 a → ⠁");

// TC02 – alphabet round-trip
const alpha = "abcdefghijklmnopqrstuvwxyz";
assert(dec1(enc1(alpha)) === alpha, "TC02 alphabet round-trip");

// TC03 – word round-trip
assert(dec1(enc1("hello")) === "hello", "TC03 hello round-trip");

// TC04 – space becomes ⠀ (U+2800)
assert(enc1("a b") === "\u2801\u2800\u2803", "TC04 space → U+2800");

// TC05 – newline preserved
const ml = "line one\nline two";
assert(dec1(enc1(ml)) === ml, "TC05 newline preserved");

// TC06 – single capital → ⠠ prefix
assert(enc1("A").startsWith("\u2820"), "TC06 single cap indicator ⠠");

// TC07 – all-caps word → ⠠⠠ prefix
assert(enc1("HELLO").startsWith("\u2820\u2820"), "TC07 word cap indicator ⠠⠠");

// TC08 – Title Case round-trip
assert(dec1(enc1("Hello World")) === "Hello World", "TC08 Title Case round-trip");

// TC09 – ALL CAPS round-trip
assert(dec1(enc1("NASA")) === "NASA", "TC09 ALL CAPS round-trip");

// TC10 – mixed case (iPad)
assert(dec1(enc1("iPad")) === "iPad", "TC10 iPad round-trip");

// TC11 – digit 1 → ⠼⠁
assert(enc1("1") === "\u283c\u2801", "TC11 digit 1 = ⠼⠁");

// TC12 – number starts with ⠼
assert(enc1("2024").startsWith("\u283c"), "TC12 numeric indicator ⠼");

// TC13 – number round-trip
assert(dec1(enc1("123")) === "123", "TC13 number round-trip");

// TC14 – numbers with space
assert(dec1(enc1("3 14")) === "3 14", "TC14 numbers with space");

// TC15 – number then word
assert(dec1(enc1("3 cats")) === "3 cats", "TC15 number then word");

// TC16 – comma
assert(enc1(",") === "\u2802", "TC16 comma → ⠂");

// TC17 – period
assert(enc1(".") === "\u2832", "TC17 period → ⠲");

// TC18 – question mark
assert(enc1("?") === "\u2826", "TC18 question mark → ⠦");

// TC19 – sentence round-trip
assert(dec1(enc1("Hello, world!")) === "Hello, world!", "TC19 sentence round-trip");

// TC20 – open paren encoded as ⠐⠣
assert(enc1("(test)").includes("\u2810\u2823"), "TC20 open paren ⠐⠣");

// TC21 – hyphen
assert(enc1("-") === "\u2824", "TC21 hyphen → ⠤");

// TC22 – pangram
const pangram = "The quick brown fox jumps over the lazy dog.";
assert(dec1(enc1(pangram)) === pangram, "TC22 pangram round-trip");

// TC23 – apostrophe
assert(dec1(enc1("it's")) === "it's", "TC23 apostrophe round-trip");

// TC24 – empty string
assert(enc1("") === "" && dec1("") === "", "TC24 empty string");

// TC25 – spaces only → ⠀⠀⠀
assert(enc1("   ") === "\u2800\u2800\u2800", "TC25 spaces → ⠀⠀⠀");

// TC26 – unknown cell produces warning
const { warnings: w26 } = decodeFromBraille("\u28ff");
assert(w26.length > 0, "TC26 unknown cell → warning");

// TC27 – unterminated capital passage → warning
const { warnings: w27 } = decodeFromBraille("\u2820\u2820\u2820\u2801\u2803");
assert(w27.some((w) => w.toLowerCase().includes("passage")), "TC27 unterminated passage → warning");

// TC28 – cap mode resets at space
assert(dec1(enc1("Hello World")) === "Hello World", "TC28 cap mode resets at space");

// TC29 – numbers in sentence
assert(dec1(enc1("I have 42 items.")) === "I have 42 items.", "TC29 numbers in sentence");

// TC30 – multiline complex
const complex = "Line 1: Hello!\nLine 2: World.";
assert(dec1(enc1(complex)) === complex, "TC30 multiline complex round-trip");

// ══════════════════════════════════════════════════════════════════════
// GRADE 2
// ══════════════════════════════════════════════════════════════════════
console.log("\n── Grade 2 ─────────────────────────────────────────");

// TC31 – "the" → ⠮
assert(enc2("the").includes("\u282e"), "TC31 'the' → ⠮");

// TC32 – "and" → ⠯
assert(enc2("and").includes("\u282f"), "TC32 'and' → ⠯");

// TC33 – "with" → ⠾
assert(enc2("with").includes("\u283e"), "TC33 'with' → ⠾");

// TC34 – "ch" in "church" → ⠡
assert(enc2("church").includes("\u2821"), "TC34 'ch' sign ⠡ in 'church'");

// TC35 – "ing" contraction in "reading"
assert(enc2("reading").includes("\u282c"), "TC35 'ing' sign ⠬ in 'reading'");

// TC36 – strong-word "but" as whole word → ⠃
assert(enc2("but") === "\u2803", "TC36 'but' whole-word → ⠃");

// TC37 – strong-word "can" → ⠉
assert(enc2("can") === "\u2809", "TC37 'can' → ⠉");

// TC38 – short form "should" shorter than Grade 1
assert(enc2("should").length < enc1("should").length, "TC38 'should' shorter in G2");

// TC39 – short form "about" shorter than Grade 1
assert(enc2("about").length < enc1("about").length, "TC39 'about' shorter in G2");

// TC40 – decode ⠮ → "the"
assert(dec2("\u282e") === "the", "TC40 ⠮ decodes to 'the'");

// TC41 – decode ⠯ → "and"
assert(dec2("\u282f") === "and", "TC41 ⠯ decodes to 'and'");

// TC42 – decode ⠡ at word boundary → "child"
assert(dec2("\u2821") === "child", "TC42 ⠡ alone → 'child'");

// TC43 – Grade 2 still applies capital indicator
assert(enc2("Hello").includes("\u2820"), "TC43 capital indicator present in G2");

// TC44 – Grade 2 still uses numeric indicator ⠼
assert(enc2("42 items").includes("\u283c"), "TC44 numeric indicator ⠼ in G2");

// TC45 – long text is shorter in G2 than G1
const prose = "The children should read with care and go beyond the words.".repeat(10);
assert(enc2(prose).length < enc1(prose).length, "TC45 G2 output shorter than G1 for prose");

// ══════════════════════════════════════════════════════════════════════
// Summary
// ══════════════════════════════════════════════════════════════════════
console.log(`\n${"─".repeat(52)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests.`);
if (failed > 0) process.exit(1);

// Suppress unused import warning — decodeFromBraille is exported for completeness
void decodeFromBraille;
