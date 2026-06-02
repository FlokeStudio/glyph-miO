<p align="center">
  <a href="https://obsidian.md/" target="_blank" rel="noopener">
    <img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" height="72" alt="Obsidian logo" />
  </a>
</p>

<h1 align="center">glyph-miO 2.3-O</h1>

<p align="center">
  <a href="https://obsidian.md/"><img src="https://img.shields.io/badge/Obsidian-Plugin-7c3aed?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTEyIDJMMyA1djE0bDkgMyA5LTNWNXoiLz48L3N2Zz4=" alt="Obsidian" /></a>
  <img src="https://img.shields.io/badge/version-2.3.0-blue?style=flat-square" alt="version" />
  <img src="https://img.shields.io/badge/mode-offline--first-green?style=flat-square" alt="offline" />
  <img src="https://img.shields.io/badge/Ollama-optional-111?style=flat-square" alt="ollama" />
  <a href="https://github.com/FlokeStudio/glyph-miO/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-GPL--3.0-orange?style=flat-square" alt="license" /></a>
</p>

<p align="center">
  <strong>Metadata Intelligence for your vault</strong> — tags, structure, and summaries without sending notes to the cloud.
</p>

Part of **Glyph 2.3-O** · Engine repo: [glyph-mi](https://github.com/FlokeStudio/glyph-mi) · Search sibling: [glyph-sO](https://github.com/FlokeStudio/glyph-sO)

---

## Features

| Command | What it does |
|---------|----------------|
| **Glyph: analyze active note** | Word count, links, heading stats |
| **Glyph: suggest tags** | Offline frequency-based `#tags` |
| **Glyph: summarize note** | Inserts a summary callout; uses **Ollama** when enabled |

Works **fully offline** without Ollama. No account, no telemetry.

---

## Install in Obsidian

### Manual (recommended for testing)

1. Download or clone this repo.
2. Copy the folder into your vault’s plugins directory:
   - **Windows:** `%vault%\.obsidian\plugins\glyph-mi-o\`
   - **macOS/Linux:** `<vault>/.obsidian/plugins/glyph-mi-o/`
3. The folder must contain `manifest.json`, `main.js`, `styles.css`, and `vendor/` (already bundled).
4. In Obsidian: **Settings → Community plugins → Turn on community plugins → Installed plugins → Enable “glyph-miO 2.3”.**
5. Reload Obsidian (`Ctrl/Cmd+R`) if commands do not appear.

### BRAT (beta track)

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) in Obsidian.
2. **BRAT → Add Beta plugin** → `FlokeStudio/glyph-miO`
3. Enable the plugin under **Community plugins**.

### From release zip

When a GitHub release is published, download `glyph-mi-o.zip` and extract it into `.obsidian/plugins/glyph-mi-o/`.

---

## Optional: Ollama (summaries)

1. Install [Ollama](https://ollama.com/) and pull a model, e.g. `ollama pull llama3.2`
2. Ensure the daemon is running (`http://127.0.0.1:11434`).
3. In Obsidian: **Settings → glyph-miO 2.3**
   - Turn on **Enable Ollama**
   - Set URL (default `http://127.0.0.1:11434`) and model name
4. Run **Glyph: summarize note** on an open note.

If Ollama is off or unreachable, summarize falls back to a short **offline** summary (topics from local word frequency).

---

## Development

Refresh vendored search/Ollama helpers from [glyph-s](https://github.com/FlokeStudio/glyph-s):

```bash
cd ../glyph-s
npm run bundle:obsidian
```

---

## Related repos

| Repo | Role |
|------|------|
| [glyph-mi](https://github.com/FlokeStudio/glyph-mi) | Senza music MI |
| [glyph-s](https://github.com/FlokeStudio/glyph-s) | Search core |
| [glyph-sO](https://github.com/FlokeStudio/glyph-sO) | Obsidian vault search |

---

Floke Studio · [GPL-3.0](LICENSE)
