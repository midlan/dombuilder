# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Run tests:**
```bash
node tests/roundtrip.mjs
```

There is no build step, package manager, or install step. Open `editor.html` or `index.html` directly in a browser.

## Architecture

**dombuilder** encodes entire HTML documents into a URL hash fragment using a three-stage pipeline:

```
HTML → Instructions → Deflate-compress → Base64url-encode → URL hash
```

The reversal is:
```
URL hash → Base64url-decode → Decompress → Execute instructions → DOM
```

### Instruction format (`dombuilder.js`)

HTML is converted into a line-based instruction language:
- `E tag` — create element, push to stack
- `A name value` — set attribute on current stack-top element
- `T text` — append text node to current stack-top element
- `^` — pop element from stack and append to parent

Special characters in attribute values and text are escaped as `\\` and `\n`.

SVG elements are detected by tag name and created with `createElementNS` using the SVG namespace.

### Key functions in `dombuilder.js`

- `htmlToInstructions(html)` — DOMParser → depth-first tree walk → instruction text
- `executeInstructions(text, target)` — stack-based DOM builder, runs instructions
- `compressText(text)` / `decompressBytes(bytes)` — browser `CompressionStream` API (deflate-raw)
- `base64urlEncode(bytes)` / `base64urlDecode(str)` — URL-safe base64 (`-_` instead of `+/`, no padding)
- `encodeInstructions(text)` / `decodeInstructions(encoded)` — async high-level API combining the above

### Entry points

- **`index.html`** — minimal viewer: reads URL hash, decodes, executes instructions into `document.body`
- **`editor.html`** — interactive editor with split-panel preview; takes HTML input, generates shareable URL
- **`tests/roundtrip.mjs`** — Node.js test runner that loads `dombuilder.js` via `Function` constructor (not ESM import), encodes/decodes each file in `tests/examples/`, and asserts byte-for-byte equality

### Deployment

GitHub Actions (`pages.yml`) deploys on git version tags (e.g. `v1`, `v2`):
- Creates a versioned directory on the `gh-pages` branch
- Bakes the version tag into editor/viewer page titles
- Updates a `/latest/` symlink
- Generates a root index listing all versions
