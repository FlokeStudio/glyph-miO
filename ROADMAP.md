# glyph-miO — technical roadmap

Metadata intelligence for Obsidian — summaries, tag suggestions, optional Ollama.

## Shipped in 2.8.0

- **Sidebar panel** — `ItemView` (`glyph-mi-o-panel`) in the right rail; modal kept as legacy alias via `panelMode: modal`
- **Vault cache** — background index (`mtime`, tags, title, wordCount) persisted under `vaultCache`; debounced rebuild on vault events
- **Batch vault analysis** — command **Glyph: analyze vault** → `{ total, untagged, suggestions[] }`
- **Frontmatter tags** — setting `tagWriteMode: inline | frontmatter`; YAML `tags` merge via `processFrontMatter`
- **Summary history** — last 10 applies in settings; **Glyph: rollback last summary**
- **Tag tooltips** — vault frequency count on chip hover (from vault cache)
- **Tests** — vitest for `frontmatter.js`, `batch-analyze.js`

## Shipped in 2.7.3

- **Theme-safe CSS** — status colors use Obsidian variables only (`--text-success`, `--color-green`)

## Week 3+

| Item | Description |
|------|-------------|
| glyph-mi notes vendor | Bundle `analyzeForNotes` from glyph-mi for shared confidence/sources |
| Confidence in UI | richer chip labels beyond relevance % |
| glyph-ui kit | shared panel chrome with glyph-sO |

## Current architecture

```
main.js                         Plugin, commands, Ollama client, settings
services/
  panel-view.js                 ItemView + shared panel mount
  frontmatter.js                applyTagsToFrontmatter (inline / YAML)
  vault-cache.js                Debounced vault index + persistence
  batch-analyze.js              analyzeVault
  summary-history.js            push / load / rollback (max 10)
  metadata.js                   Weighted tag scoring
  summary.js                    Extractive summary + lifecycle modes
  i18n.js                       EN/RU strings
  glyph-mi-notes-adapter.js     Local analyzeNote (glyph-mi stub)
```

## Links

- [glyph-mi](https://github.com/krwg/glyph-mi)
- [glyph-sO](https://github.com/FlokeStudio/glyph-sO) — search companion
