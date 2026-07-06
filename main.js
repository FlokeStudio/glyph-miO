const {
  Plugin,
  Modal,
  Notice,
  PluginSettingTab,
  Setting,
  MarkdownView,
} = require('obsidian');

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
    if (!res.ok) {
      console.warn('glyph-miO: Ollama', res.status, res.statusText);
      return null;
    }
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

const SUMMARY_MARKER = '<!-- glyph-miO-summary -->';

const STOP_WORDS = new Set([
  'the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'note', 'tags', 'and', 'for',
  'для', 'как', 'это', 'при', 'что', 'или', 'эта', 'этот', 'того', 'быть', 'были', 'может',
  'также', 'через', 'после', 'если', 'когда', 'только', 'уже', 'все', 'всё', 'его', 'ее', 'её',
]);

function stripForSummary(body) {
  return String(body || '')
    .replace(/^---[\s\S]*?---\n?/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/#{1,6}\s+/gm, '')
    .replace(/[*_~>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  const parts = text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return s.length > 18;
    });
  return parts.length ? parts : [text.trim()];
}

function extractiveSummary(body, meta) {
  const plain = stripForSummary(body);
  if (!plain) return 'Заметка пуста — нечего пересказывать.';
  const sentences = splitSentences(plain);
  if (sentences.length <= 2) return sentences.join(' ');

  const words = plain.toLowerCase().match(/[a-zа-яё0-9]{4,}/gi) || [];
  const freq = new Map();
  words.forEach(function (w) {
    const k = w.toLowerCase();
    if (!STOP_WORDS.has(k)) freq.set(k, (freq.get(k) || 0) + 1);
  });
  (meta.headings || []).forEach(function (h) {
    String(h)
      .toLowerCase()
      .split(/\s+/)
      .forEach(function (w) {
        if (w.length > 3) freq.set(w, (freq.get(w) || 0) + 8);
      });
  });

  const scored = sentences.map(function (s, i) {
    const sw = s.toLowerCase().match(/[a-zа-яё0-9]{4,}/gi) || [];
    let sc = 0;
    sw.forEach(function (w) {
      sc += freq.get(w) || 0;
    });
    if (i < 2) sc += 3;
    return { s: s, sc: sc, i: i };
  });
  scored.sort(function (a, b) {
    return b.sc - a.sc;
  });

  const picked = [];
  const seen = new Set();
  for (let pi = 0; pi < scored.length && picked.length < 4; pi++) {
    const key = scored[pi].s.slice(0, 48);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push({ s: scored[pi].s, i: scored[pi].i });
  }
  picked.sort(function (a, b) {
    return a.i - b.i;
  });
  return picked.map(function (p) {
    return p.s;
  }).join(' ');
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
      self.insertFromPanel()
    );
    actions.createEl('button', { text: 'Go to summary' }).addEventListener('click', () =>
      self.plugin.jumpToSummary()
    );
    actions.createEl('button', { text: 'Copy #tags' }).addEventListener('click', () =>
      self.copyTags()
    );
    this.summaryPreviewEl = contentEl.createEl('div', { cls: 'glyph-mio-summary-preview' });
    this.summaryStatusEl = contentEl.createEl('p', { cls: 'glyph-mio-summary-status' });
    contentEl.createEl('p', {
      cls: 'glyph-mio-help',
      text:
        '«Insert summary» — краткий пересказ в конце заметки (callout). Сначала Analyze, затем вставка. Go to summary — перейти к блоку.',
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

    const preview = extractiveSummary(doc.body, meta);
    this._previewSummary = preview;
    if (this.summaryPreviewEl) {
      this.summaryPreviewEl.empty();
      this.summaryPreviewEl.createEl('div', { cls: 'glyph-mio-preview-label', text: 'Черновик пересказа:' });
      this.summaryPreviewEl.createEl('div', { cls: 'glyph-mio-preview-text', text: preview });
    }
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

  async insertFromPanel() {
    const ok = await this.plugin.summarizeNote({ fromPanel: true });
    if (ok && this.summaryStatusEl) {
      this.summaryStatusEl.setText(
        'Пересказ добавлен в конец «' + ok.title + '» (стр. ~' + ok.line + ', ' + ok.mode + ').'
      );
    }
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
    this.addCommand({
      id: 'glyph-mio-jump-summary',
      name: 'Glyph: jump to MI summary',
      callback: () => this.jumpToSummary(),
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

  async summarizeNote(opts) {
    opts = opts || {};
    const doc = await this.readActive();
    if (!doc) {
      new Notice('Откройте заметку / Open a note first');
      return null;
    }
    const meta = this.algorithmicMeta(doc.file.basename, doc.body, doc.cache);
    const excerpt = doc.body.slice(0, 6000);
    let summaryText = null;
    let summaryTags = meta.tags;
    let mode = 'offline';

    if (this.settings.useOllama) {
      const ok = await ollamaAvailable({ ollamaUrl: this.settings.ollamaUrl });
      if (ok) {
        new Notice('Glyph: пишем пересказ (Ollama)…', 3000);
        const parsed = await ollamaJson(
          {
            prompt:
              'Ты редактор Obsidian. Прочитай заметку и напиши краткий пересказ смысла (3–5 предложений) на том же языке, что основной текст. ' +
              'В summary не перечисляй теги и метаданные — только пересказ содержания. ' +
              'Ответ строго JSON: {"summary":"текст пересказа","tags":["тег1","тег2"]}\n\n' +
              'Заголовок: ' +
              meta.title +
              '\nРазделы: ' +
              meta.headings.join(', ') +
              '\n\nТекст:\n' +
              excerpt,
          },
          {
            ollamaUrl: this.settings.ollamaUrl,
            model: this.settings.ollamaModel,
            timeoutMs: 60000,
          }
        );
        if (parsed && parsed.summary) {
          summaryText = String(parsed.summary).trim();
          summaryTags = Array.isArray(parsed.tags) ? parsed.tags : meta.tags;
          mode = 'Ollama';
        } else {
          new Notice('Ollama недоступна (500?) — офлайн-пересказ', 5000);
        }
      } else {
        new Notice('Ollama не запущена — офлайн-пересказ', 4000);
      }
    }

    if (!summaryText) {
      summaryText = extractiveSummary(doc.body, meta);
      mode = 'extractive';
    }

    const placed = await this.insertSummary(summaryText, summaryTags);
    if (!placed) return null;

    const modeLabel =
      mode === 'Ollama' ? 'пересказ (Ollama)' : mode === 'extractive' ? 'пересказ (офлайн)' : 'пересказ';
    if (!opts.fromPanel) {
      new Notice(
        modeLabel + ' в конце «' + meta.title + '» (~стр. ' + placed.line + '). Jump to MI summary',
        6000
      );
    }
    return { title: meta.title, line: placed.line, mode: mode, summary: summaryText };
  }

  async insertSummary(text, tags) {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;
    const editor = view.editor;
    const insertAt = editor.lastLine() + 1;
    const body =
      '\n\n---\n' +
      SUMMARY_MARKER +
      '\n> [!summary] Glyph MI-O\n> ' +
      text.replace(/\n/g, '\n> ') +
      '\n';
    const tagLine = tags.length ? '\n' + tags.map((t) => '#' + String(t).replace(/^#/, '')).join(' ') + '\n' : '\n';
    editor.replaceRange(body + tagLine, { line: editor.lastLine(), ch: editor.getLine(editor.lastLine()).length });
    const cursorLine = insertAt + 2;
    editor.setCursor({ line: cursorLine, ch: 0 });
    editor.scrollIntoView(
      { from: { line: Math.max(0, insertAt), ch: 0 }, to: { line: cursorLine + 4, ch: 0 } },
      true
    );
    return { line: insertAt + 1 };
  }

  jumpToSummary() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice('Откройте заметку с саммари');
      return;
    }
    const editor = view.editor;
    const total = editor.lastLine();
    for (let line = total; line >= 0; line--) {
      const text = editor.getLine(line);
      if (text.indexOf(SUMMARY_MARKER) >= 0 || text.indexOf('[!summary] Glyph MI-O') >= 0) {
        editor.setCursor({ line: line, ch: 0 });
        editor.scrollIntoView({ from: { line: line, ch: 0 }, to: { line: line + 6, ch: 0 } }, true);
        new Notice('Саммари Glyph MI-O');
        return;
      }
    }
    new Notice('Саммари не найдено — сначала «Insert summary»');
  }
}

module.exports = GlyphMiOPlugin;
