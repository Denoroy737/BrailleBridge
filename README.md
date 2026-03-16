# BrailleBridge

**BrailleBridge** is an accurate bidirectional English ↔ Braille converter that supports both **Grade 1 (uncontracted)** and **Grade 2 (contracted)** Unified English Braille (UEB).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion 12
- **State Management:** Zustand 5
- **Notifications:** Sonner 2

---

## Quick Start

To get started with BrailleBridge, follow these steps:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Start development server (Turbopack)
npm run dev          # → Open in your browser: http://localhost:3000

# 4. Build for production
npm run build && npm start
```

---

## API

### `POST /api/convert`

#### Request Example

```json
{ "text": "Hello World", "direction": "encode", "grade": 2 }
```

#### Response Example

```json
{ "result": "⠠⠓⠑⠇⠇⠕⠀⠠⠺⠕⠗⠇⠙" }
```

| Field       | Type                         | Required | Notes                          |
|-------------|------------------------------|----------|--------------------------------|
| `text`      | string                       | ✅       | Maximum 50,000 characters      |
| `direction` | `"encode"` \| `"decode"`    | ✅       | Specify conversion direction    |
| `grade`     | `1` \| `2`                  | optional | Default: `1`                   |

---

## Grade 2 Contraction Coverage

| Type                   | Count | Description                                        |
|------------------------|-------|----------------------------------------------------|
| Always contractions     | 19    | `ch`, `sh`, `th`, `wh`, `ed`, `er`, `ou`, `ow`, `ar`, `ing`, `st`, `and`, `for`, `of`, `the`, `with`, `ble`, `ous` |
| Strong-word signs      | 28    | `but`, `can`, `do`, `every`, … single-cell whole-word only |
| Short-form words       | 49    | `about`, `should`, `braille`, `children`, `because`, … multi-cell abbreviations |

### Encoder Algorithm (per token)

1. Strip leading/trailing punctuation temporarily.
2. Try **short-form** lookup (whole word, highest priority).
3. Try **strong-word** lookup (whole word).
4. Fall back to character-by-character with **greedy longest-match** for always-contractions.
5. Re-attach punctuation.

### Decoder Algorithm (per cell)

1. Handle whitespace → reset word-level states.
2. Check multi-cell indicators (⠠⠠⠠, ⠠⠠, ⠠⠄, ⠰⠰, ⠰⠄).
3. Check single-cell indicators (⠠, ⠼, ⠰).
4. Numeric mode: digit lookup.
5. **Greedy longest-match contraction** (skipped if ⠰ grade-1 active).
6. Strong-word contractions only applied at word boundaries.
7. Two-cell punctuation.
8. Letter lookup.
9. Single-cell punctuation.
10. Unknown → warn and skip.

---

## Known Limitations

- Grade 2 word-boundary detection uses space-splitting; hyphenated tokens are treated as one unit.
- No support for Nemeth Code (math braille).
- No support for music braille.
- No support for 8-dot computer braille.
- Short-form "word" and "would" share the same braille pattern (⠺⠙); both decode to "would" — context-dependent disambiguation is not implemented.

---

## Accessibility Features

- WCAG AAA contrast (pure monochrome palette).
- `aria-live` on all conversion output regions.
- Roles: `tabpanel`, `tablist`, `alert`, `region`.
- Full keyboard navigation supported.
- `prefers-reduced-motion` respected.
- Skip-to-main-content link included.
- Screen-reader labels on all interactive elements.

---

## License

This project is licensed under the MIT License.
