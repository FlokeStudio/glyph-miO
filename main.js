const {
  Plugin,
  Modal,
  Notice,
  PluginSettingTab,
  Setting,
  MarkdownView,
} = require('obsidian');

/* --- inlined Ollama (no vendor/) --- */
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3.2';

function parseJsonLoose(text) {
  const raw = String(text || '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch (e) {
    return null;
  }
}

async function ollamaAvailable(options) {
  options = options || {};
  const baseUrl = options.ollamaUrl || DEFAULT_OLLAMA_URL;
  try {
    const res = await fetch(baseUrl + '/api/tags', { method: 'GET' });
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function ollamaGenerate(req, options) {
  options = options || {};
  const baseUrl = options.ollamaUrl || DEFAULT_OLLAMA_URL;
  const model = options.model || DEFAULT_OLLAMA_MODEL;
  const timeout = options.timeoutMs != null ? options.timeoutMs : 12000;
  const controller = new AbortController();
  const timer = setTimeout(function () {
    controller.abort();
  }, timeout);
  try {
    const res = await fetch(baseUrl + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: model,
        stream: false,
        format: req.format || 'json',
        prompt: req.prompt,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.response != null ? data.response : null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function ollamaJson(req, options) {
  const text = await ollamaGenerate(
    Object.assign({}, req, { format: 'json' }),
    options
  );
  return text ? parseJsonLoose(text) : null;
}

const DEFAULT_SETTINGS = {
  ollamaUrl: DEFAULT_OLLAMA_URL,
  ollamaModel: DEFAULT_OLLAMA_MODEL,
  useOllama: true,
};

class GlyphMiOSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Glyph MI-O 2.3' });

    new Setting(containerEl)
      .setName('Enable Ollama')
      .setDesc('Optional local LLM for summaries (algorithmic mode works without it).')
      .addToggle((t) =>
        t.setValue(this.plugin.settings.useOllama).onChange(async (v) => {
          this.plugin.settings.useOllama = v;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('Ollama URL')
      .addText((t) =>
        t
          .setPlaceholder(DEFAULT_OLLAMA_URL)
          .setValue(this.plugin.settings.ollamaUrl)
          .onChange(async (v) => {
            this.plugin.settings.ollamaUrl = v || DEFAULT_OLLAMA_URL;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Model')
      .addText((t) =>
        t
          .setPlaceholder(DEFAULT_OLLAMA_MODEL)
          .setValue(this.plugin.settings.ollamaModel)
          .onChange(async (v) => {
            this.plugin.settings.ollamaModel = v || DEFAULT_OLLAMA_MODEL;
            await this.plugin.saveSettings();
          })
      );
  }
}

class GlyphMiOPanel extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('glyph-mio-panel');
    contentEl.createEl('h2', { text: 'glyph-miO 2.3' });
    contentEl.createEl('p', {
      cls: 'glyph-mio-lead',
      text: 'Metadata Intelligence for the active note — offline; Ollama optional for summaries.',
    });
    this.statsEl = contentEl.createEl('div', { cls: 'glyph-mio-stats' });
    this.tagsEl = contentEl.createEl('div', { cls: 'glyph-mio-tags' });
    const actions = contentEl.createEl('div', { cls: 'glyph-mio-actions' });
    const self = this;
    actions.createEl('button', { text: 'Analyze', cls: 'mod-cta' }).addEventListener('click', () =>
      self.refresh()
    );
    actions.createEl('button', { text: 'Insert summary' }).addEventListener('click', () =>
      self.plugin.summarizeNote()
    );
    actions.createEl('button', { text: 'Copy #tags' }).addEventListener('click', () =>
      self.copyTags()
    );
    contentEl.createEl('p', {
      cls: 'glyph-mio-help',
      text: 'Settings → Community plugins → glyph-miO → gear icon. Enable Ollama for richer summaries.',
    });
    this.refresh();
  }

  async refresh() {
    const doc = await this.plugin.readActive();
    if (!doc) {
      this.statsEl.setText('Open a markdown note first.');
      this.tagsEl.empty();
      return;
    }
    const meta = this.plugin.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    this._meta = meta;
    this.statsEl.empty();
    this.statsEl.createEl('div', { text: 'Title: ' + meta.title });
    this.statsEl.createEl('div', { text: 'Words: ' + meta.wordCount + ' · Links: ' + meta.links });
    if (meta.headings.length) {
      this.statsEl.createEl('div', { text: 'Headings: ' + meta.headings.slice(0, 5).join(' · ') });
    }
    this.tagsEl.empty();
    const plugin = this.plugin;
    meta.tags.forEach((tag) => {
      const chip = this.tagsEl.createEl('button', { cls: 'glyph-mio-tag', text: '#' + tag });
      chip.addEventListener('click', () => {
        const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const pos = view.editor.getCursor();
        view.editor.replaceRange('#' + tag + ' ', pos);
      });
    });
  }

  copyTags() {
    if (!this._meta || !this._meta.tags.length) {
      new Notice('No tags');
      return;
    }
    const line = this._meta.tags.map((t) => '#' + t).join(' ');
    navigator.clipboard.writeText(line);
    new Notice('Tags copied');
  }
}

class GlyphMiOPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new GlyphMiOSettingTab(this.app, this));
    this.addRibbonIcon('sparkles', 'Glyph MI-O', () => this.openPanel());
    this.addCommand({
      id: 'glyph-mio-panel',
      name: 'Glyph: open MI panel',
      callback: () => this.openPanel(),
    });
    this.addCommand({
      id: 'glyph-mio-analyze',
      name: 'Glyph: analyze active note',
      callback: () => this.analyzeActiveNote(),
    });
    this.addCommand({
      id: 'glyph-mio-tags',
      name: 'Glyph: suggest tags',
      callback: () => this.suggestTags(),
    });
    this.addCommand({
      id: 'glyph-mio-summarize',
      name: 'Glyph: summarize note',
      callback: () => this.summarizeNote(),
    });
  }

  openPanel() {
    new GlyphMiOPanel(this.app, this).open();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async readActive() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return null;
    const body = await this.app.vault.read(file);
    const cache = this.app.metadataCache.getFileCache(file);
    return { file, body, cache };
  }

  algorithmicMeta(basename, body, cache) {
    const words = body.toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || [];
    const freq = new Map();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    const stop = /^(the|that|this|with|from|have|will|your|note|tags|для|как|это|при|что|или)$/i;
    const tags = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w)
      .filter((w) => !stop.test(w));
    const headings = (cache && cache.headings ? cache.headings : [])
      .map((h) => h.heading)
      .slice(0, 8);
    const links = cache && cache.links ? cache.links.length : 0;
    let frontTags = [];
    const rawTags = cache && cache.frontmatter && cache.frontmatter.tags;
    if (Array.isArray(rawTags)) frontTags = rawTags.map(String);
    else if (rawTags != null && rawTags !== '') frontTags = [String(rawTags)];
    return {
      title: basename.replace(/\.md$/i, ''),
      tags: [...new Set([...frontTags, ...tags])].slice(0, 12),
      headings,
      links,
      wordCount: words.length,
    };
  }

  async analyzeActiveNote() {
    const doc = await this.readActive();
    if (!doc) {
      new Notice('No active note');
      return;
    }
    const meta = this.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    new Notice(
      'Glyph: ' + meta.tags.length + ' tags · ' + meta.links + ' links · ' + meta.wordCount + ' words'
    );
  }

  async suggestTags() {
    const doc = await this.readActive();
    if (!doc) return;
    const meta = this.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    const line = meta.tags.map((t) => '#' + t).join(' ');
    new Notice(line || 'No tags suggested');
  }

  async summarizeNote() {
    const doc = await this.readActive();
    if (!doc) return;
    const meta = this.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    const excerpt = doc.body.slice(0, 6000);

    if (this.settings.useOllama) {
      const ok = await ollamaAvailable({ ollamaUrl: this.settings.ollamaUrl });
      if (ok) {
        const parsed = await ollamaJson(
          {
            prompt:
              'Summarize this Obsidian note in 2-4 sentences. Reply JSON only: {"summary":"...","tags":["..."]}\n\nTitle: ' +
              meta.title +
              '\nHeadings: ' +
              meta.headings.join(', ') +
              '\n\n' +
              excerpt,
          },
          {
            ollamaUrl: this.settings.ollamaUrl,
            model: this.settings.ollamaModel,
            timeoutMs: 45000,
          }
        );
        if (parsed && parsed.summary) {
          await this.insertSummary(parsed.summary, parsed.tags || meta.tags);
          new Notice('Glyph: summary added (Ollama)');
          return;
        }
      }
    }

    const fallback =
      '**' +
      meta.title +
      '** — ' +
      meta.wordCount +
      ' words, ' +
      meta.links +
      ' links. Key topics: ' +
      (meta.tags.slice(0, 6).join(', ') || '—') +
      '.';
    await this.insertSummary(fallback, meta.tags);
    new Notice('Glyph: summary added (offline)');
  }

  async insertSummary(text, tags) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    const editor = view.editor;
    const block = '\n\n> [!summary] Glyph MI-O\n> ' + text.replace(/\n/g, '\n> ') + '\n\n';
    const tagLine = tags.length ? '\n' + tags.map((t) => '#' + t).join(' ') + '\n' : '';
    editor.replaceRange(block + tagLine, { line: editor.lastLine(), ch: 0 });
  }
}

module.exports = GlyphMiOPlugin;
