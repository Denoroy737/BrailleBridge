# BrailleBridge

Accurate bidirectional English ↔ Braille converter supporting **Grade 1 (uncontracted)** and **Grade 2 (contracted)** Unified English Braille (UEB).

Built with **Next.js 16 App Router**, TypeScript (strict), Tailwind CSS v4, Framer Motion 12, Zustand 5, Sonner 2.

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local

# 3. Dev (Turbopack)
npm run dev          # → http://localhost:3000

# 4. Production
npm run build && npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout, metadata, Toaster
│   ├── page.tsx                Home (Suspense → MainApp)
│   ├── globals.css             Tailwind v4 @theme + base
│   ├── error.tsx               Global error boundary
│   ├── sitemap.ts / robots.ts  SEO stubs
│   └── api/convert/route.ts   POST /api/convert
├── components/
│   ├── MainApp.tsx             Client shell, tab routing
│   ├── Header.tsx              Logo, theme toggle, history button
│   ├── TabBar.tsx              Encode / Decode / Reference
│   ├── GradeToggle.tsx         Grade 1 ↔ Grade 2 switcher
│   ├── EncoderPanel.tsx        Text → Braille
│   ├── DecoderPanel.tsx        Braille → Text
│   ├── ReferencePanel.tsx      Searchable symbol table
│   ├── BrailleVisualizer.tsx   Interactive 6-dot grid
│   ├── HistoryDrawer.tsx       Slide-in history panel
│   └── ThemeScript.tsx         Inline theme init
├── lib/braille/
│   ├── mappings.ts             UEB Grade 1 maps + utilities
│   ├── encoder.ts              Grade 1 encoder
│   ├── decoder.ts              Grade 1 decoder
│   ├── utils.ts                Shared helpers
│   └── grade2/
│       ├── contractions.ts     Grade 2 contraction table (130+ entries)
│       ├── encoder2.ts         Grade 2 greedy encoder
│       └── decoder2.ts         Grade 2 contraction-aware decoder
├── store/
│   └── useAppStore.ts          Zustand (history, theme, grade)
└── middleware.ts               Security headers
```

---

## API

### `POST /api/convert`

```json
{ "text": "Hello World", "direction": "encode", "grade": 2 }
```

```json
{ "result": "⠠⠓⠑⠇⠇⠕⠀⠠⠺⠕⠗⠇⠙" }
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `text` | string | ✅ | Max 50,000 chars |
| `direction` | `"encode"` \| `"decode"` | ✅ | |
| `grade` | `1` \| `2` | optional | Default: `1` |

---

## Grade 2 Contraction Coverage

| Type | Count | Description |
|---|---|---|
| Always contractions | 19 | `ch` `sh` `th` `wh` `ed` `er` `ou` `ow` `ar` `ing` `st` `and` `for` `of` `the` `with` `ble` `ous` |
| Strong-word signs | 28 | `but` `can` `do` `every` … single-cell whole-word only |
| Short-form words | 49 | `about` `should` `braille` `children` `because` … multi-cell abbreviations |

### Encoder algorithm (per token)
1. Strip leading/trailing punctuation temporarily
2. Try **short-form** lookup (whole word, highest priority)
3. Try **strong-word** lookup (whole word)
4. Fall through to char-by-char with **greedy longest-match** always-contractions
5. Re-attach punctuation

### Decoder algorithm (per cell)
1. Handle whitespace → reset word-level states
2. Check multi-cell indicators (⠠⠠⠠, ⠠⠠, ⠠⠄, ⠰⠰, ⠰⠄)
3. Check single-cell indicators (⠠, ⠼, ⠰)
4. Numeric mode: digit lookup
5. **Greedy longest-match contraction** (skipped if ⠰ grade-1 active)
6. Strong-word contractions only applied at word boundaries
7. Two-cell punctuation
8. Letter lookup
9. Single-cell punctuation
10. Unknown → warn + skip

---

## Known Limitations

- Grade 2 word-boundary detection uses space-splitting; hyphenated tokens treated as one unit
- No Nemeth Code (math braille)
- No music braille
- No 8-dot computer braille
- Short-form "word" and "would" share the same braille pattern (⠺⠙); both decode to "would" — context-dependent disambiguation not implemented

---

## Vercel Deployment

```bash
npx vercel --prod
# Framework: Next.js (auto-detected)
# Env vars: copy from .env.example
```

---

## Accessibility

- WCAG AAA contrast (pure monochrome palette)
- `aria-live` on all conversion output regions
- `role="tabpanel"`, `role="tablist"`, `role="alert"`, `role="region"`
- Full keyboard navigation
- `prefers-reduced-motion` respected
- Skip-to-main-content link
- Screen-reader labels on all interactive elements

---

## License

MIT
