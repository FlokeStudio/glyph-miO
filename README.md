<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.3</h1>

<p align="center">
  <a href="README.ru.md">🇷🇺 Русская документация</a>
</p>

## Why glyph-miO (for you)

**glyph-miO** adds **Metadata Intelligence** to your vault — not just tags, but a **short retelling** of the active note you can drop into the journal.

| What you get | How |
|--------------|-----|
| **Real summary** | 3–5 sentences (Ollama) or extractive recap offline |
| **Tag suggestions** | From headings + word frequency; click to insert `#tag` |
| **Preview before insert** | **Analyze** shows draft summary in the panel |
| **Clear placement** | **Insert summary** → end of note, callout `> [!summary] Glyph MI-O` |
| **Jump to summary** | Button or command **Glyph: jump to MI summary** |

Pair with **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)**: find a note with Glyph Search, open it, run **Insert summary**.

Works **offline**; [Ollama](https://ollama.com/) optional for richer Russian/English prose.

### Quick start

1. Open a note.
2. Ribbon **✨** or **`Glyph: open MI panel`**.
3. **Analyze** — stats + draft summary + tag chips.
4. **Insert summary** — scrolls to the new block at the bottom.

If Ollama returns **500**, you still get an **offline extractive** summary (no empty callout).

---

## Install

```powershell
powershell -ExecutionPolicy Bypass -File F:\floke_dev\scripts\install-glyph-obsidian.ps1
```

`YOUR_VAULT/.obsidian/plugins/glyph-mi-o/` → enable → **Ctrl+R**.

No npm · no `vendor/`.

---

## Ollama (optional)

```bash
ollama pull llama3.2
ollama serve
```

**Settings → glyph-miO** → Enable Ollama → `http://127.0.0.1:11434`

If the model errors (HTTP 500), disable Ollama or fix the model name — offline summary still works.

---

## Commands

| Command | Action |
|---------|--------|
| **Glyph: open MI panel** | Main UI |
| **Glyph: summarize note** | Insert summary at end |
| **Glyph: jump to MI summary** | Go to last Glyph block |
| **Glyph: analyze active note** | Quick notice |
| **Glyph: suggest tags** | Copy-friendly tag list |

---

## Technical

- Offline: extractive sentence ranking over note body.
- Optional: Ollama JSON `{"summary","tags"}`.
- Related: [glyph-mi](https://github.com/FlokeStudio/glyph-mi) (Senza) · [glyph-sO](https://github.com/FlokeStudio/glyph-sO) (search).

GPL-3.0 · Floke Studio
