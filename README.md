<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.3-O</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7c3aed" alt="Obsidian" />
  <img src="https://img.shields.io/badge/version-2.3.0-blue" alt="version" />
  <img src="https://img.shields.io/badge/offline--first-green" alt="offline" />
  <a href="README.ru.md">Russianя</a>
</p>

**Metadata Intelligence** for Obsidian — analyze notes, suggest tags, insert summaries. Works offline; [Ollama](https://ollama.com/) optional.

Part of **Glyph 2.3-O** · [glyph-mi](https://github.com/FlokeStudio/glyph-mi) (Senza) · [glyph-sO](https://github.com/FlokeStudio/glyph-sO) (search)

---

## Quick start

1. Install the plugin (see below).
2. Open any note.
3. Click the **sparkles** ribbon icon or run **`Glyph: open MI panel`**.
4. In the panel: **Analyze** → see stats and tag chips → click a chip to insert `#tag` at cursor.
5. **Insert summary** adds a callout at the bottom (Ollama if enabled in settings).

| Command | Action |
|---------|--------|
| **Glyph: open MI panel** | Main GUI (recommended) |
| **Glyph: analyze active note** | Quick stats notice |
| **Glyph: suggest tags** | Notice with `#tags` |
| **Glyph: summarize note** | Summary callout (+ optional Ollama) |

---

## Install

Copy this folder to:

`YOUR_VAULT/.obsidian/plugins/glyph-mi-o/`

Required files: `manifest.json`, `main.js`, `styles.css` (no `npm install`, no `vendor/`).

Or from repo root:

```powershell
powershell -ExecutionPolicy Bypass -File path\to\floke_dev\scripts\install-glyph-obsidian.ps1
```

Enable **glyph-miO 2.3** under **Settings → Community plugins**, then **Ctrl+R**.

**BRAT:** `FlokeStudio/glyph-miO`

---

## Ollama (optional)

```bash
ollama pull llama3.2
```

**Settings → glyph-miO 2.3** → Enable Ollama → URL `http://127.0.0.1:11434`

Without Ollama, summaries use a short offline digest from local word frequency.

---

## Related

| Repo | Role |
|------|------|
| [glyph-mi](https://github.com/FlokeStudio/glyph-mi) | Music MI for Senza |
| [glyph-s](https://github.com/FlokeStudio/glyph-s) | Search engine |
| [glyph-sO](https://github.com/FlokeStudio/glyph-sO) | Vault search plugin |

GPL-3.0 · Floke Studio
