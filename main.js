const {
  Plugin,
  Notice,
  PluginSettingTab,
  Setting,
  MarkdownView,
} = require('obsidian');
const {
  ollamaJson,
  ollamaAvailable,
  DEFAULT_OLLAMA_URL,
  DEFAULT_OLLAMA_MODEL,
} = require('./vendor/ollama.cjs');

const DEFAULT_SETTINGS = {
  ollamaUrl: DEFAULT_OLLAMA_URL,
  ollamaModel: DEFAULT_OLLAMA_MODEL,
  useOllama: true,
};

class GlyphMiOSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin.containerEl);
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

class GlyphMiOPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new GlyphMiOSettingTab(this.app, this));
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
      name: 'Glyph: summarize note (Ollama)',
      callback: () => this.summarizeNote(),
    });
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
    const words = body.toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) || [];
    const freq = new Map();
    for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
    const stop = /^(the|that|this|with|from|have|will|your|note|tags|для|как|это|при|что|или)$/iu;
    const tags = [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w)
      .filter((w) => !stop.test(w));
    const headings = (cache?.headings || []).map((h) => h.heading).slice(0, 8);
    const links = (cache?.links || []).length;
    const frontTags = (cache?.frontmatter?.tags || [])
      .flat()
      .map(String);
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
    new Notice(`Glyph: ${meta.tags.length} tags · ${meta.links} links · ${meta.wordCount} words`);
  }

  async suggestTags() {
    const doc = await this.readActive();
    if (!doc) return;
    const meta = this.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    const line = meta.tags.map((t) => `#${t}`).join(' ');
    new Notice(line || 'No tags suggested');
  }

  async summarizeNote() {
    const doc = await this.readActive();
    if (!doc) return;
    const meta = this.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    const excerpt = doc.body.slice(0, 6000);

    if (this.settings.useOllama) {
      const ok = await ollamaAvailable({
        ollamaUrl: this.settings.ollamaUrl,
      });
      if (ok) {
        const parsed = await ollamaJson(
          {
            prompt: `Summarize this Obsidian note in 2-4 sentences. Reply JSON only: {"summary":"...","tags":["..."]}\n\nTitle: ${meta.title}\nHeadings: ${meta.headings.join(', ')}\n\n${excerpt}`,
          },
          {
            ollamaUrl: this.settings.ollamaUrl,
            model: this.settings.ollamaModel,
            timeoutMs: 45000,
          }
        );
        if (parsed?.summary) {
          await this.insertSummary(parsed.summary, parsed.tags || meta.tags);
          new Notice('Glyph: summary added (Ollama)');
          return;
        }
      }
    }

    const fallback = `**${meta.title}** — ${meta.wordCount} words, ${meta.links} links. Key topics: ${meta.tags.slice(0, 6).join(', ') || '—'}.`;
    await this.insertSummary(fallback, meta.tags);
    new Notice('Glyph: summary added (offline)');
  }

  async insertSummary(text, tags) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    const editor = view.editor;
    const block = `\n\n> [!summary] Glyph MI-O\n> ${text.replace(/\n/g, '\n> ')}\n\n`;
    const tagLine = tags.length ? `\n${tags.map((t) => `#${t}`).join(' ')}\n` : '';
    editor.replaceRange(block + tagLine, { line: editor.lastLine(), ch: 0 });
  }
}

module.exports = GlyphMiOPlugin;
