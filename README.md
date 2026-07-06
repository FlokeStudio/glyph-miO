<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.7</h1>

<p align="center">
  <a href="https://flokestudio.github.io/glyph-miO/">Site</a> ·
  <a href="README.ru.md">README.ru</a> ·
  <a href="https://github.com/FlokeStudio/glyph-sO">glyph-sO</a>
</p>

## User section

`glyph-miO` analyzes the active note and creates a compact summary block with suggested tags.

### New in 2.7

- Service-based architecture:
  - `services/metadata.js`
  - `services/summary.js`
- Weighted metadata scoring with cache by note mtime/size.
- Summary lifecycle mode:
  - `append`
  - `replace-latest`
- Cleaner minimalist panel spacing.

### Install

Copy to `.obsidian/plugins/glyph-mi-o/`:

- `manifest.json`
- `main.js`
- `styles.css`
- `services/`
- `vendor/`

Enable plugin in **Settings → Community plugins**.

## GitHub / Dev section

### Commands

- `Glyph: open MI panel`
- `Glyph: summarize note`
- `Glyph: jump to MI summary`
- `Glyph: analyze active note`
- `Glyph: suggest tags`

### Runtime behavior

- Offline extractive summary is always available.
- If Ollama is enabled and available, plugin attempts JSON summary generation first.
- If Ollama fails, plugin safely falls back to offline summary.

### Packaging

Release workflow now includes `services/` and `vendor/` in plugin zip.

## License

GPL-3.0 · Floke Studio
