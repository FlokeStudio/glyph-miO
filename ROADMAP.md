# glyph-miO — technical roadmap

Metadata intelligence for Obsidian — summaries, tag suggestions, optional Ollama.

## Shipped in 2.7.3

- **Theme-safe CSS** — status colors use Obsidian variables only (`--text-success`, `--color-green`)

## Week 2

- **Sidebar panel** — `ItemView` in the right rail instead of Modal-only workflow
- Inline tag hover: vault frequency count

## Week 3+

| Item | Description |
|------|-------------|
| Incremental vault index | Background precompute on vault open for instant analysis |
| Batch vault analysis | Command: “Analyze vault” → summary of untagged notes |
| Frontmatter tags | Option: write `tags: [a, b]` in YAML instead of inline `#tag` |
| Confidence in UI | `#projects (94%)` chips (partially present via relevance %) |
| Summary history | Last 10 applies + rollback |

## Current architecture

```
main.js                 Plugin, Modal panel, commands
services/
  metadata.js           Weighted tag scoring (title > heading > body)
  summary.js            Extractive summary + lifecycle modes
  i18n.js               EN/RU strings
  glyph-mi-notes-adapter.js  Future glyph-mi notes contract
```

## Links

- [glyph-mi](https://github.com/krwg/glyph-mi)
- [glyph-sO](https://github.com/FlokeStudio/glyph-sO) — search companion
