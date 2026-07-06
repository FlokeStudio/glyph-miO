<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.7</h1>

<p align="center">
  <strong>Metadata Intelligence for Obsidian</strong><br>
  Summaries · tag suggestions · offline-first analysis
</p>

<p align="center">
  <a href="https://flokestudio.github.io/glyph-miO/">Site</a> ·
  <a href="README.ru.md">README.ru</a> ·
  <a href="https://github.com/FlokeStudio/glyph-sO">glyph-sO</a> ·
  <a href="https://github.com/krwg/glyph-mi">glyph-mi</a>
</p>

---

## User section

### What is glyph-miO?

**glyph-miO** is an Obsidian community plugin that analyzes the **active note** and helps you organize knowledge faster:

- **Extractive summaries** — a compact block of key sentences inserted at the top of the note
- **Tag suggestions** — ranked by relevance to title, headings, and body text
- **Offline by default** — no cloud, no API keys; optional local Ollama enhancement

It pairs naturally with [**glyph-sO**](https://github.com/FlokeStudio/glyph-sO): search finds notes across the vault; glyph-miO understands the note you’re working on right now.

### What’s new in 2.7

**Service-based architecture** — core logic split into focused modules:

| Service | Responsibility |
|---------|----------------|
| `services/metadata.js` | Weighted tag scoring, stop-word filtering, analysis cache |
| `services/summary.js` | Sentence extraction, summary block formatting, marker lifecycle |

**Weighted metadata scoring** — tags are ranked using multiple signals:

- Matches in the note title (highest weight)
- Frequency in headings
- Density in body paragraphs
- Existing frontmatter / inline tags (boost)

Results are **cached** by note path, modification time, and content size — re-analysis is instant when nothing changed.

**Summary lifecycle modes:**

| Mode | Behavior |
|------|----------|
| `append` | Each summarize action adds a new `<!-- glyph-mi summary -->` block |
| `replace-latest` | Updates the most recent summary block in place (default) |

**Cleaner UI** — refined panel spacing and typography for a minimalist Obsidian-native feel.

### Install

1. Download the latest release from [Releases](https://github.com/FlokeStudio/glyph-miO/releases).
2. Extract into your vault:

```
.obsidian/plugins/glyph-mi-o/
├── manifest.json
├── main.js
├── styles.css
└── services/
    ├── metadata.js
    └── summary.js
```

3. Enable **glyph-miO** in **Settings → Community plugins**.

### Commands

| Command | What it does |
|---------|--------------|
| **Glyph: open MI panel** | Interactive panel with tags and summary preview |
| **Glyph: summarize note** | Insert or update the summary block |
| **Glyph: jump to MI summary** | Cursor jumps to the `<!-- glyph-mi summary -->` marker |
| **Glyph: analyze active note** | Run analysis without opening the panel |
| **Glyph: suggest tags** | Apply top-ranked tag suggestions to the note |

### Settings

| Setting | Description |
|---------|-------------|
| **Enable Ollama** | Try local LLM for JSON-structured summaries (default: on) |
| **Ollama URL** | Base URL, default `http://127.0.0.1:11434` |
| **Model** | Ollama model name, default `llama3.2` |
| **Summary block mode** | `append` or `replace-latest` |

### How analysis works

1. **Offline path (always available):** the plugin tokenizes the note, scores tag candidates, selects key sentences for the summary, and formats a marked block.
2. **Ollama path (optional):** if Ollama responds within the timeout, the plugin requests a JSON summary with tags. On failure or timeout, it **falls back** to the offline algorithm — no error dialogs, no broken workflow.

### Example summary block

```markdown
<!-- glyph-mi summary -->
**Summary:** This note covers project planning for Q3, including milestone
definitions and resource allocation across three teams.

**Tags:** #projects #planning #q3
<!-- /glyph-mi summary -->
```

---

## GitHub / Dev section

### Architecture (2.7)

```
main.js                 # Obsidian plugin: UI, Ollama client, commands
services/metadata.js    # computeMetadataCached, weighted scoring
services/summary.js     # extractiveSummary, buildSummaryBlock, SUMMARY_MARKER
styles.css              # .glyph-mio-panel styles
```

### Metadata cache key

`computeMetadataCached(doc, settings)` keys the cache by:

- File path
- `stat.mtime` (modification time)
- Content length

Cache invalidates automatically when the note is edited.

### Ollama integration

- Health check: `GET /api/tags`
- Generation: `POST /api/generate` with `format: "json"`
- Timeout: 12 seconds (configurable in code)
- Graceful fallback to `extractiveSummary()` on any failure

### Project layout

| Path | Role |
|------|------|
| `main.js` | Plugin class, panel modal, settings tab, command registration |
| `services/metadata.js` | Tag scoring engine with `STOP_WORDS` filter |
| `services/summary.js` | Sentence splitting, summary block builder |
| `.github/workflows/release.yml` | Packages `services/` into release zip |
| `.github/workflows/pages.yml` | Deploys `docs/` to GitHub Pages |

### Related repositories

| Repo | Role |
|------|------|
| [glyph-mi](https://github.com/krwg/glyph-mi) | Universal MI core (Senza, Cultiva modules) |
| [glyph-sO](https://github.com/FlokeStudio/glyph-sO) | Full-text search for Obsidian |
| [glyph-s](https://github.com/FlokeStudio/glyph-s) | Shared search engine |

### License

GPL-3.0 · Floke Studio
