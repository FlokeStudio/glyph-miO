<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.7.1</h1>

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

- **Extractive summaries** — a compact callout block inserted at the end of the note
- **Tag suggestions** — ranked by relevance to title, headings, and body, with scores/tooltips
- **Offline by default** — no cloud, no API keys; optional local Ollama enhancement

It pairs naturally with [**glyph-sO**](https://github.com/FlokeStudio/glyph-sO): search finds notes across the vault; glyph-miO understands the note you’re working on right now. Long-term UI chrome aims to share a **glyph-ui** styling kit with sO.

### What’s new in 2.7.1

- **Safer metadata cache key** — always includes vault path plus mtime, size, and a short content hash (documented in `services/metadata.js`)
- **Summary mode `none` / `off`** — preview in the MI panel only; write when you Insert / run summarize explicitly
- **Ollama timeout setting** — configurable seconds (default **12**), used for generate calls
- **Tag explainability** — relevance % on chips + tooltip (title / heading / body / frontmatter)
- **Ollama status** — status bar + panel pill (online / offline fallback / disabled)
- **Optional diff preview** — Apply / Cancel modal before insert or replace
- **RU labels** — commands and settings follow Obsidian language when set to Russian
- **Adapter stub** — `services/glyph-mi-notes-adapter.js` ready to consume glyph-mi `notes` without breaking the local offline path

### What’s in 2.7

**Service-based architecture** — core logic in focused modules:

| Service | Responsibility |
|---------|----------------|
| `services/metadata.js` | Weighted tag scoring, stop-words, cache key |
| `services/summary.js` | Sentence extraction, block formatting, lifecycle modes |
| `services/i18n.js` | EN/RU strings for commands and settings |
| `services/glyph-mi-notes-adapter.js` | Stub toward shared glyph-mi `notes` contract |

**Weighted metadata scoring** — tags ranked by:

- Matches in the note title (highest weight)
- Frequency in headings
- Density in body paragraphs
- Existing frontmatter tags (boost)

**Summary lifecycle modes:**

| Mode | Behavior |
|------|----------|
| `append` | Each summarize/insert adds a new `<!-- glyph-miO-summary -->` block |
| `replace-latest` | Updates the most recent summary block in place (default) |
| `none` / `off` | Do not auto-write; show draft in the panel; insert only via Insert / summarize command |

### Install

1. Download the latest release from [Releases](https://github.com/FlokeStudio/glyph-miO/releases) (or clone `main`).
2. Extract into your vault:

```
.obsidian/plugins/glyph-mi-o/
├── manifest.json
├── main.js
├── styles.css
└── services/
    ├── metadata.js
    ├── summary.js
    ├── i18n.js
    └── glyph-mi-notes-adapter.js
```

3. Enable **glyph-miO** in **Settings → Community plugins**.

### Commands

| Command (EN) | Command (RU) | What it does |
|--------------|--------------|--------------|
| **Glyph: open MI panel** | **Glyph: открыть панель MI** | Interactive panel with tags and summary preview |
| **Glyph: summarize note** | **Glyph: пересказ заметки** | Insert or update the summary block (respects mode + diff preview) |
| **Glyph: jump to MI summary** | **Glyph: перейти к саммари MI** | Cursor jumps to the summary marker |
| **Glyph: analyze active note** | **Glyph: анализ активной заметки** | Run analysis without opening the panel |
| **Glyph: suggest tags** | **Glyph: предложить теги** | Show top-ranked tags with relevance % |

### Settings

| Setting | Description |
|---------|-------------|
| **Enable Ollama** | Try local LLM for JSON-structured summaries (default: on) |
| **Ollama URL** | Base URL, default `http://127.0.0.1:11434` |
| **Model** | Ollama model name, default `llama3.2` |
| **Ollama timeout (seconds)** | Abort generation after N seconds (default **12**), then offline fallback |
| **Summary block mode** | `append`, `replace-latest`, `none`, or `off` |
| **Diff preview before Apply** | Show before/after modal (Apply / Cancel) before writing |

### How analysis works

1. **Offline path (always available):** tokenize → score tags with reasons → pick key sentences → format marked block.
2. **Ollama path (optional):** if Ollama responds within the configured timeout, request JSON summary + tags. On failure or timeout, **fall back** to the offline algorithm.

### Architecture note (local vs glyph-mi)

MI logic for this plugin currently lives in local **`services/*`**. Roadmap: consume the shared [glyph-mi](https://github.com/krwg/glyph-mi) **`notes`** module for a common contract (`confidence` / `sources`) via the thin adapter stub — without removing the offline path. Shared **glyph-ui** styling with glyph-sO is a parallel goal.

### Example summary block

```markdown
---
<!-- glyph-miO-summary -->
> [!summary] Glyph MI-O
> This note covers project planning for Q3, including milestone
> definitions and resource allocation across three teams.

#projects #planning #q3
```

---

## GitHub / Dev section

### Architecture (2.7.1)

```
main.js                              # Plugin UI, Ollama client, commands, status bar
services/metadata.js                 # computeMetadataCached, cache key, tagDetails
services/summary.js                  # extractiveSummary, buildSummaryBlock, none/off
services/i18n.js                     # EN/RU labels
services/glyph-mi-notes-adapter.js   # stub → future glyph-mi notes module
styles.css                           # panel, status, diff modal
```

### Metadata cache key

`keyForDoc(file, body)` is always:

```text
${path}|${mtime}|${size}|${contentHash}
```

Path is mandatory (collision-safe across notes). See JSDoc in `services/metadata.js`.

### Ollama integration

- Health check: `GET /api/tags`
- Generation: `POST /api/generate` with `format: "json"`
- Timeout: settings **Ollama timeout (seconds)** (default 12)
- Status: status bar item + MI panel pill
- Graceful fallback to `extractiveSummary()` on any failure

### Related repositories

| Repo | Role |
|------|------|
| [glyph-mi](https://github.com/krwg/glyph-mi) | Universal MI core (Senza, Cultiva, future `notes`) |
| [glyph-sO](https://github.com/FlokeStudio/glyph-sO) | Full-text search for Obsidian |
| [glyph-s](https://github.com/FlokeStudio/glyph-s) | Shared search engine |

### License

GPL-3.0 · Floke Studio
