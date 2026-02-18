# dombuilder

Don't wanna setup hosting for every microsite you need? Now you can build a microsite using just a URL.

## Example

```
https://midlan.github.io/dombuilder/latest/#VZCxbsMw
```

## Editor

Open `editor.html` to write HTML in a split-panel editor with live preview. Click **Run** to generate a shareable URL, then use the **Copy** button to grab it.

## How It Works

DomBuilder encodes an entire HTML page into the URL's hash fragment — no server, no database, no hosting needed.

1. **HTML to instructions** — the editor parses your HTML and converts it into a compact instruction set (`E` create element, `A` set attribute, `T` add text, `^` close element).
2. **Compress** — the instructions are compressed using deflate-raw via the browser's built-in `CompressionStream` API.
3. **Base64url encode** — the compressed bytes are encoded into a URL-safe base64 string and appended as the `#hash` fragment.
4. **Render** — when someone opens the URL, `index.html` reads the hash, decompresses it back into instructions, and executes them to rebuild the DOM.

The hash fragment is never sent to any server — everything happens client-side in the browser.

### Versioned deployments

Each git tag is automatically deployed to GitHub Pages under its own directory (e.g. `/v1/`, `/v2/`), so older links keep working forever. A `/latest/` symlink always points to the most recently deployed version tag (`v1`, `v2`, …).
