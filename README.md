# dombuilder

Don't wanna setup hosting for every microsite you need? Now you can build a microsite using just a URL. The microsite will live in your bookmarks forever!

## Example

```
https://midlan.github.io/dombuilder/latest/#c1XIMOQKUfBIzcnJVwjPL8pJUeSK4wpRiMkDAA
```

## Editor

Open [`editor.html`](https://midlan.github.io/dombuilder/latest/editor.html) to write HTML in a split-panel editor with live preview. Click **Run** to generate a URL, then use the **Copy** button to grab it.

## How It Works

dombuilder encodes an entire HTML page into the URL’s hash fragment—no server, no database, and no hosting required.

1. **HTML to instructions** — the editor parses your HTML and converts it into a compact instruction set (`E` create element, `A` set attribute, `T` add text, `^` close element).
2. **Compress** — the instructions are compressed using deflate-raw via the browser's built-in `CompressionStream` API.
3. **Base64url encode** — the compressed bytes are encoded into a URL-safe base64 string and appended as the `#hash` fragment.
4. **Render** — when someone opens the URL, `index.html` reads the hash, decompresses it back into instructions, and executes them to rebuild the DOM.

The hash fragment of a URL is never sent to the web server, making it privacy-compliant by design. However, be careful: anyone you share the link with can read its contents, as it is not encrypted.

### Versioned deployments

Each release is automatically deployed to GitHub Pages under its own directory (e.g. `/v1/`, `/v2/`), so older links keep working forever. A `/latest/` symlink always points to the most recently deployed version tag (`v1`, `v2`, …).

### Offline

You can also clone repository to your device, than use `index.html` to open your links even without internet connection.
