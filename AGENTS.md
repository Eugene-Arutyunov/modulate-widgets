# AGENTS.md

## Cursor Cloud specific instructions

This is a static frontend project (vanilla HTML/CSS/JS) with **no package manager, no build step, no linting tools, and no automated test framework**.

### Running the application

Serve files with any static HTTP server. The simplest option:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in Chrome.

### Key pages

- `index.html` — Main dashboard with all charts and interactive size controls.
- `responsive.html` — Responsive layout variant (uses `responsive.css`).
- `test-single.html` — Single scatterplot test page.

### Notes

- There are no dependencies to install — all JavaScript is vanilla and loaded via `<script>` tags.
- Chart data lives in `config-sc*.js` and `config-bar1.js` files. The main rendering logic is in `script.js`.
- The Google Fonts stylesheet (`Inter`) is loaded from a CDN, so network access is needed for proper font rendering.
- There is no linting, testing, or build tooling configured in this repository.
