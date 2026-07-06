<p align="center">
  <a href="https://obsidian.md/"><img src="https://obsidian.md/images/obsidian-logo-gradient.svg" width="72" alt="Obsidian" /></a>
</p>

<h1 align="center">glyph-miO 2.3</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7c3aed" alt="Obsidian plugin" />
  <img src="https://img.shields.io/badge/Glyph--MI-2.3-green" alt="Glyph-MI 2.3" />
  <img src="https://img.shields.io/badge/version-2.3.0-blue" alt="version 2.3.0" />
  <img src="https://img.shields.io/badge/offline--first-brightgreen" alt="offline first" />
  <img src="https://img.shields.io/badge/Ollama-optional-orange" alt="Ollama optional" />
  <img src="https://img.shields.io/badge/license-GPL--3.0-lightgrey" alt="GPL-3.0" />
</p>

<p align="center">
  <strong>Metadata Intelligence for Obsidian</strong> — analyze notes, suggest tags, insert a <em>short retelling</em> at the end of the note.<br/>
  Works offline; local LLM via <a href="https://ollama.com/">Ollama</a> is optional.
</p>

<p align="center">
  <a href="README.ru.md">🇷🇺 Русская документация</a>
  ·
  <a href="https://flokestudio.github.io/glyph-miO/">Site</a>
  ·
  <a href="https://github.com/FlokeStudio/glyph-sO">glyph-sO</a> (vault search)
  ·
  <a href="https://github.com/FlokeStudio/glyph-mi">glyph-mi</a> (Senza)
</p>

---

## What is glyph-miO?

**glyph-miO** is a free **community plugin for [Obsidian](https://obsidian.md/)**. It looks at the **currently open note** and helps you:

- understand it at a glance (**word count**, links, headings),
- get **suggested `#tags`** (click to insert at the cursor),
- add a **short summary (retelling)** — not just keywords, but sentences that describe what the note is about,
- place that summary **clearly at the end of the note** in a callout block you can jump back to later.

It is the Obsidian face of **Glyph Metadata Intelligence (MI) 2.3**. No cloud account, no npm build step.

If you only need “find a word in my vault”, install **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)** first. Many people use **both**: sO finds the note, miO summarizes it.

---

## What you get (vs “just tags”)

| Feature | What it does |
|---------|----------------|
| **Analyze** | Stats + **draft summary preview** in the panel before you insert anything |
| **Tag chips** | Suggested tags from headings and word frequency — click to insert `#tag` |
| **Insert summary** | Adds a **retelling** (3–5 sentences with Ollama, or extractive offline) at the **bottom** of the active note |
| **Go to summary / Jump command** | Scroll to the last Glyph summary block |
| **Copy #tags** | Copy suggested tags to the clipboard |

**Offline summary** picks the most informative sentences from your note (extractive method).  
**Ollama summary** writes a smoother paraphrase in the note’s language — only if Ollama is running and the model responds.

---

## Install (first time)

### Step 1 — Enable community plugins in Obsidian

1. **Settings → Community plugins**
2. Disable **Restricted mode** if needed
3. **Turn on community plugins**

### Step 2 — Install glyph-miO

#### A) Manual install

1. Download or clone [this repository](https://github.com/FlokeStudio/glyph-miO).
2. In your vault: `.obsidian/plugins/glyph-mi-o/` (create folders if missing).
3. Copy into that folder:
   - `manifest.json`
   - `main.js`
   - `styles.css`

   ```
   YourVault/
     .obsidian/
       plugins/
         glyph-mi-o/
           manifest.json
           main.js
           styles.css
   ```

4. Enable **glyph-miO 2.3** under community plugins.
5. **Ctrl+R** to reload Obsidian.

#### B) BRAT

**BRAT** → **Add Beta plugin** → `FlokeStudio/glyph-miO` → enable → reload.

#### C) Git

```bash
cd /path/to/YourVault/.obsidian/plugins
git clone https://github.com/FlokeStudio/glyph-miO.git glyph-mi-o
```

---

## First steps after install

1. Open **any markdown note** (daily note, journal, project doc).
2. Click the **sparkles ✨** icon on the left ribbon **or** run **`Glyph: open MI panel`** from the command palette (`Ctrl+P`).
3. Click **Analyze** — you should see title, word count, headings, tag chips, and a **draft summary** box.
4. Click **Insert summary** — Obsidian scrolls to the **end of the note** and adds:

   ```markdown
   ---
   <!-- glyph-miO-summary -->
   > [!summary] Glyph MI-O
   > Your retelling here…

   #suggested #tags
   ```

5. If you do not see it, use **Go to summary** in the panel or **`Glyph: jump to MI summary`** — or press **Ctrl+End** in the editor.

> The summary is always appended to the **active note** — the one you had open when you clicked Insert.

---

## Commands

| Command | When to use |
|---------|-------------|
| **Glyph: open MI panel** | Main window (Analyze, tags, summary) |
| **Glyph: summarize note** | Insert summary without opening the panel |
| **Glyph: jump to MI summary** | Go to the last Glyph summary block |
| **Glyph: analyze active note** | Quick popup with tag/link/word stats |
| **Glyph: suggest tags** | Show suggested tags in a notice |

---

## Ollama (optional, local only)

For richer summaries you can run **[Ollama](https://ollama.com/)** on your computer:

```bash
ollama pull llama3.2
ollama serve
```

In Obsidian: **Settings → glyph-miO 2.3** → **Enable Ollama** → URL `http://127.0.0.1:11434` → model name (e.g. `llama3.2`).

| Situation | What happens |
|-----------|----------------|
| Ollama off | **Offline extractive** summary — always works |
| Ollama on, model OK | JSON summary + tags from the LLM |
| HTTP **500** or timeout | Notice in Obsidian, **fallback to offline** summary — you still get text |

**500 errors** usually mean: Ollama not running, wrong model name, or model not pulled. Fix Ollama or disable it in settings — the plugin remains useful offline.

---

## Recommended workflow with glyph-sO

1. **[glyph-sO](https://github.com/FlokeStudio/glyph-sO)** — search `шаурма` / `shawarma` / wrong layout → open the note.  
2. **glyph-miO** — **Analyze** → check draft → **Insert summary**.  
3. Later — **Jump to MI summary** to re-read the recap.

Install sO into `.obsidian/plugins/glyph-s-o/` the same way as miO.

---

## Settings

| Setting | Meaning |
|---------|---------|
| **Enable Ollama** | Use local LLM for summaries when available |
| **Ollama URL** | Usually `http://127.0.0.1:11434` |
| **Model** | Must match `ollama list` (e.g. `llama3.2`) |

---

## Troubleshooting

### “Where did my summary go?”

At the **bottom of the same note** you had open. Use **Go to summary** or search inside the note for `Glyph MI-O` or `glyph-miO-summary`.

### Summary is only statistics / tags

Ollama failed or is disabled — you get **extractive** text (real sentences from the note, compressed). Enable Ollama for a more “written” paraphrase.

### Panel says “Open a markdown note first”

Click inside a note tab, not empty pane or graph view.

### Plugin error on load

Folder must be **`glyph-mi-o`**. Do not put a `vendor/` folder — this release is a single `main.js`.

---

## Technical

- **Offline:** strip markdown → score sentences → pick top sentences → join as summary.
- **Ollama:** prompt returns JSON `{"summary":"…","tags":["…"]}`.
- **Senza sibling:** [glyph-mi](https://github.com/FlokeStudio/glyph-mi) (music metadata, not Obsidian).

Obsidian ≥ 1.5.0.

---

## License

GPL-3.0 · [Floke Studio](https://github.com/FlokeStudio)
