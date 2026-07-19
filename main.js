const {
  Plugin,
  Modal,
  Notice,
  PluginSettingTab,
  Setting,
  MarkdownView,
} = require('obsidian');
const { analyzeNote } = require('./services/glyph-mi-notes-adapter');
const {
  SUMMARY_MARKER,
  extractiveSummary,
  buildSummaryBlock,
  isPreviewOnlyMode,
  resolveWriteMode,
} = require('./services/summary');
const { t, detectLang, reasonLabel } = require('./services/i18n');

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';
const DEFAULT_OLLAMA_MODEL = 'llama3.2';
const DEFAULT_OLLAMA_TIMEOUT_SEC = 12;

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
  const timeoutSec =
    options.timeoutSec != null
      ? Number(options.timeoutSec)
      : options.timeoutMs != null
        ? Number(options.timeoutMs) / 1000
        : DEFAULT_OLLAMA_TIMEOUT_SEC;
  const timeout = Math.max(1, timeoutSec) * 1000;
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
  const text = await ollamaGenerate(Object.assign({}, req, { format: 'json' }), options);
  return text ? parseJsonLoose(text) : null;
}

const DEFAULT_SETTINGS = {
  ollamaUrl: DEFAULT_OLLAMA_URL,
  ollamaModel: DEFAULT_OLLAMA_MODEL,
  useOllama: true,
  ollamaTimeoutSec: DEFAULT_OLLAMA_TIMEOUT_SEC,
  summaryMode: 'replace-latest',
  previewBeforeApply: true,
};

function formatTagTooltip(detail, lang) {
  if (!detail) return '';
  const pct = Math.round((detail.relevance != null ? detail.relevance : 0) * 100);
  const reasons = (detail.reasons || [])
    .map((r) => reasonLabel(r, lang))
    .join(', ');
  return t('relevanceTitle', lang) + ': ' + pct + '%' + (reasons ? ' — ' + reasons : '');
}

class SummaryDiffModal extends Modal {
  constructor(app, plugin, opts) {
    super(app);
    this.plugin = plugin;
    this.opts = opts || {};
  }

  onOpen() {
    const { contentEl } = this;
    const lang = this.plugin.lang();
    contentEl.addClass('glyph-mio-diff');
    contentEl.createEl('h2', { text: t('diffTitle', lang) });

    const grid = contentEl.createEl('div', { cls: 'glyph-mio-diff-grid' });
    const beforeCol = grid.createEl('div', { cls: 'glyph-mio-diff-col' });
    beforeCol.createEl('div', { cls: 'glyph-mio-diff-label', text: t('diffBefore', lang) });
    beforeCol.createEl('pre', { cls: 'glyph-mio-diff-pre', text: this.opts.beforeText || '' });

    const afterCol = grid.createEl('div', { cls: 'glyph-mio-diff-col' });
    afterCol.createEl('div', { cls: 'glyph-mio-diff-label', text: t('diffAfter', lang) });
    afterCol.createEl('pre', { cls: 'glyph-mio-diff-pre', text: this.opts.afterText || '' });

    const actions = contentEl.createEl('div', { cls: 'glyph-mio-actions' });
    const self = this;
    actions.createEl('button', { text: t('diffApply', lang), cls: 'mod-cta' }).addEventListener('click', () => {
      self.close();
      if (typeof self.opts.onApply === 'function') self.opts.onApply();
    });
    actions.createEl('button', { text: t('diffCancel', lang) }).addEventListener('click', () => {
      self.close();
      if (typeof self.opts.onCancel === 'function') self.opts.onCancel();
    });
  }
}

class GlyphMiOSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const lang = this.plugin.lang();
    containerEl.empty();
    containerEl.createEl('h2', { text: t('settingsTitle', lang) + ' 2.7' });

    new Setting(containerEl)
      .setName(t('enableOllama', lang))
      .setDesc(t('enableOllamaDesc', lang))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.useOllama).onChange(async (v) => {
          this.plugin.settings.useOllama = v;
          await this.plugin.saveSettings();
          this.plugin.refreshOllamaStatus();
        })
      );

    new Setting(containerEl)
      .setName(t('ollamaUrl', lang))
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_OLLAMA_URL)
          .setValue(this.plugin.settings.ollamaUrl)
          .onChange(async (v) => {
            this.plugin.settings.ollamaUrl = v || DEFAULT_OLLAMA_URL;
            await this.plugin.saveSettings();
            this.plugin.refreshOllamaStatus();
          })
      );

    new Setting(containerEl)
      .setName(t('ollamaModel', lang))
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_OLLAMA_MODEL)
          .setValue(this.plugin.settings.ollamaModel)
          .onChange(async (v) => {
            this.plugin.settings.ollamaModel = v || DEFAULT_OLLAMA_MODEL;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('ollamaTimeout', lang))
      .setDesc(t('ollamaTimeoutDesc', lang))
      .addText((text) =>
        text
          .setPlaceholder(String(DEFAULT_OLLAMA_TIMEOUT_SEC))
          .setValue(String(this.plugin.settings.ollamaTimeoutSec ?? DEFAULT_OLLAMA_TIMEOUT_SEC))
          .onChange(async (v) => {
            const n = parseInt(String(v).trim(), 10);
            this.plugin.settings.ollamaTimeoutSec =
              Number.isFinite(n) && n > 0 ? n : DEFAULT_OLLAMA_TIMEOUT_SEC;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('summaryMode', lang))
      .setDesc(t('summaryModeDesc', lang))
      .addDropdown((d) =>
        d
          .addOption('append', 'append')
          .addOption('replace-latest', 'replace-latest')
          .addOption('none', 'none')
          .addOption('off', 'off')
          .setValue(this.plugin.settings.summaryMode || 'replace-latest')
          .onChange(async (v) => {
            this.plugin.settings.summaryMode = v;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName(t('previewBeforeApply', lang))
      .setDesc(t('previewBeforeApplyDesc', lang))
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.previewBeforeApply !== false).onChange(async (v) => {
          this.plugin.settings.previewBeforeApply = v;
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
    const lang = this.plugin.lang();
    contentEl.addClass('glyph-mio-panel');
    contentEl.createEl('h2', { text: t('panelTitle', lang) + ' 2.7' });
    contentEl.createEl('p', {
      cls: 'glyph-mio-lead',
      text: t('panelLead', lang),
    });
    this.ollamaStatusEl = contentEl.createEl('div', { cls: 'glyph-mio-ollama-status' });
    this.statsEl = contentEl.createEl('div', { cls: 'glyph-mio-stats' });
    this.tagsEl = contentEl.createEl('div', { cls: 'glyph-mio-tags' });
    const actions = contentEl.createEl('div', { cls: 'glyph-mio-actions' });
    const self = this;
    actions.createEl('button', { text: t('analyze', lang), cls: 'mod-cta' }).addEventListener('click', () =>
      self.refresh()
    );
    actions.createEl('button', { text: t('insertSummary', lang) }).addEventListener('click', () =>
      self.insertFromPanel()
    );
    actions.createEl('button', { text: t('goToSummary', lang) }).addEventListener('click', () =>
      self.plugin.jumpToSummary()
    );
    actions.createEl('button', { text: t('copyTags', lang) }).addEventListener('click', () =>
      self.copyTags()
    );
    this.summaryPreviewEl = contentEl.createEl('div', { cls: 'glyph-mio-summary-preview' });
    this.summaryStatusEl = contentEl.createEl('p', { cls: 'glyph-mio-summary-status' });
    contentEl.createEl('p', {
      cls: 'glyph-mio-help',
      text: t('help', lang),
    });
    this.refreshOllamaBadge();
    this.refresh();
  }

  async refreshOllamaBadge() {
    if (!this.ollamaStatusEl) return;
    const lang = this.plugin.lang();
    const state = await this.plugin.getOllamaState();
    this.ollamaStatusEl.empty();
    const el = this.ollamaStatusEl.createEl('span', {
      cls: 'glyph-mio-status-pill glyph-mio-status-' + state.kind,
      text: state.label,
    });
    el.setAttr('title', state.detail || state.label);
  }

  async refresh() {
    const lang = this.plugin.lang();
    await this.refreshOllamaBadge();
    const doc = await this.plugin.readActive();
    if (!doc) {
      this.statsEl.setText(t('openNote', lang));
      this.tagsEl.empty();
      return;
    }
    const meta = this.plugin.algorithmicMeta(doc.file, doc.body, doc.cache);
    this._meta = meta;
    this.statsEl.empty();
    this.statsEl.createEl('div', { text: 'Title: ' + meta.title });
    this.statsEl.createEl('div', { text: 'Words: ' + meta.wordCount + ' · Links: ' + meta.links });
    if (meta.headings.length) {
      this.statsEl.createEl('div', { text: 'Headings: ' + meta.headings.slice(0, 5).join(' · ') });
    }
    this.tagsEl.empty();
    const plugin = this.plugin;
    const details = meta.tagDetails || meta.tags.map((tag) => ({ tag, relevance: 0.5, reasons: ['body'] }));
    details.forEach((detail) => {
      const tag = detail.tag || detail;
      const pct = Math.round((detail.relevance != null ? detail.relevance : 0.5) * 100);
      const chip = this.tagsEl.createEl('button', {
        cls: 'glyph-mio-tag',
        text: '#' + tag + ' · ' + pct + '%',
      });
      chip.setAttr('title', formatTagTooltip(detail, lang));
      chip.addEventListener('click', () => {
        const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const pos = view.editor.getCursor();
        view.editor.replaceRange('#' + tag + ' ', pos);
      });
    });

    const preview = meta.summaryPreview || extractiveSummary(doc.body, meta);
    this._previewSummary = preview;
    if (this.summaryPreviewEl) {
      this.summaryPreviewEl.empty();
      this.summaryPreviewEl.createEl('div', {
        cls: 'glyph-mio-preview-label',
        text: t('previewLabel', lang),
      });
      this.summaryPreviewEl.createEl('div', { cls: 'glyph-mio-preview-text', text: preview });
    }
  }

  copyTags() {
    const lang = this.plugin.lang();
    if (!this._meta || !this._meta.tags.length) {
      new Notice(t('noTags', lang));
      return;
    }
    const line = this._meta.tags.map((x) => '#' + x).join(' ');
    navigator.clipboard.writeText(line);
    new Notice(t('tagsCopied', lang));
  }

  async insertFromPanel() {
    const ok = await this.plugin.summarizeNote({ fromPanel: true, forceInsert: true });
    if (ok && this.summaryStatusEl) {
      this.summaryStatusEl.setText(
        'Пересказ / summary → «' +
          ok.title +
          '»' +
          (ok.line != null ? ' (~' + ok.line + ', ' + ok.mode + ')' : ' (' + ok.mode + ')')
      );
    }
    await this.refreshOllamaBadge();
  }
}

class GlyphMiOPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this._metaCache = new Map();
    this._ollamaState = { kind: 'unknown', label: 'MI', detail: '' };
    this.addSettingTab(new GlyphMiOSettingTab(this.app, this));
    this.addRibbonIcon('sparkles', 'Glyph MI-O', () => this.openPanel());

    const lang = this.lang();
    this.addCommand({
      id: 'glyph-mio-panel',
      name: t('cmdPanel', lang),
      callback: () => this.openPanel(),
    });
    this.addCommand({
      id: 'glyph-mio-analyze',
      name: t('cmdAnalyze', lang),
      callback: () => this.analyzeActiveNote(),
    });
    this.addCommand({
      id: 'glyph-mio-tags',
      name: t('cmdTags', lang),
      callback: () => this.suggestTags(),
    });
    this.addCommand({
      id: 'glyph-mio-summarize',
      name: t('cmdSummarize', lang),
      callback: () => this.summarizeNote({ forceInsert: true }),
    });
    this.addCommand({
      id: 'glyph-mio-jump-summary',
      name: t('cmdJump', lang),
      callback: () => this.jumpToSummary(),
    });

    this.statusBarItem = this.addStatusBarItem();
    this.statusBarItem.addClass('glyph-mio-status-bar');
    this.statusBarItem.setText('MI');
    this.statusBarItem.setAttr('aria-label', 'glyph-miO Ollama status');
    this.statusBarItem.addEventListener('click', () => this.openPanel());
    await this.refreshOllamaStatus();
    this._statusTimer = window.setInterval(() => this.refreshOllamaStatus(), 30000);
  }

  onunload() {
    if (this._statusTimer) window.clearInterval(this._statusTimer);
  }

  lang() {
    return detectLang();
  }

  openPanel() {
    new GlyphMiOPanel(this.app, this).open();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (this.settings.ollamaTimeoutSec == null) {
      this.settings.ollamaTimeoutSec = DEFAULT_OLLAMA_TIMEOUT_SEC;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async getOllamaState() {
    const lang = this.lang();
    if (!this.settings.useOllama) {
      return {
        kind: 'disabled',
        label: t('statusOllamaDisabled', lang),
        detail: 'useOllama=false',
      };
    }
    const ok = await ollamaAvailable({ ollamaUrl: this.settings.ollamaUrl });
    if (ok) {
      return {
        kind: 'online',
        label: t('statusOllamaOn', lang),
        detail: this.settings.ollamaUrl,
      };
    }
    return {
      kind: 'offline',
      label: t('statusOllamaOff', lang),
      detail: 'fallback extractive',
    };
  }

  async refreshOllamaStatus() {
    const state = await this.getOllamaState();
    this._ollamaState = state;
    if (this.statusBarItem) {
      this.statusBarItem.setText(state.label);
      this.statusBarItem.setAttr('title', state.detail || state.label);
      this.statusBarItem.removeClass('glyph-mio-status-online');
      this.statusBarItem.removeClass('glyph-mio-status-offline');
      this.statusBarItem.removeClass('glyph-mio-status-disabled');
      this.statusBarItem.addClass('glyph-mio-status-' + state.kind);
    }
    return state;
  }

  async readActive() {
    const file = this.app.workspace.getActiveFile();
    if (!file) return null;
    const body = await this.app.vault.read(file);
    const cache = this.app.metadataCache.getFileCache(file);
    return { file, body, cache };
  }

  algorithmicMeta(file, body, cache) {
    return analyzeNote(file, body, cache, { cache: this._metaCache });
  }

  async analyzeActiveNote() {
    const doc = await this.readActive();
    if (!doc) {
      new Notice(t('openNote', this.lang()));
      return;
    }
    const meta = this.algorithmicMeta(doc.file, doc.body, doc.cache);
    new Notice(
      'Glyph: ' + meta.tags.length + ' tags · ' + meta.links + ' links · ' + meta.wordCount + ' words'
    );
  }

  async suggestTags() {
    const doc = await this.readActive();
    if (!doc) return;
    const meta = this.algorithmicMeta(doc.file, doc.body, doc.cache);
    const details = meta.tagDetails || [];
    const line = details.length
      ? details
          .slice(0, 8)
          .map((d) => '#' + d.tag + '(' + Math.round(d.relevance * 100) + '%)')
          .join(' ')
      : meta.tags.map((x) => '#' + x).join(' ');
    new Notice(line || t('noTags', this.lang()));
  }

  async summarizeNote(opts) {
    opts = opts || {};
    const lang = this.lang();
    const doc = await this.readActive();
    if (!doc) {
      new Notice(t('openNote', lang));
      return null;
    }
    const meta = this.algorithmicMeta(doc.file, doc.body, doc.cache);
    const excerpt = doc.body.slice(0, 6000);
    let summaryText = null;
    let summaryTags = meta.tags;
    let mode = 'offline';

    if (this.settings.useOllama) {
      const ok = await ollamaAvailable({ ollamaUrl: this.settings.ollamaUrl });
      await this.refreshOllamaStatus();
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
            timeoutSec: this.settings.ollamaTimeoutSec ?? DEFAULT_OLLAMA_TIMEOUT_SEC,
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

    const previewOnly = isPreviewOnlyMode(this.settings.summaryMode);
    const shouldWrite = opts.forceInsert === true || opts.fromPanel === true || !previewOnly;

    if (!shouldWrite) {
      if (!opts.fromPanel) {
        new Notice(t('previewOnlyNotice', lang) + '\n' + summaryText.slice(0, 180), 8000);
      }
      return { title: meta.title, line: null, mode: 'preview', summary: summaryText };
    }

    const placed = await this.insertSummary(summaryText, summaryTags, { confirm: true });
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

  buildNextDocument(fullText, summary) {
    const writeMode = summary.mode;
    if (writeMode === 'replace-latest') {
      const markerIdx = fullText.lastIndexOf(summary.marker);
      if (markerIdx >= 0) {
        // Drop the leading `\n\n---` that buildSummaryBlock prepends, so
        // replace-latest does not accumulate extra horizontal rules.
        const hrIdx = fullText.lastIndexOf('\n---\n', markerIdx);
        const cutAt = hrIdx >= 0 && markerIdx - hrIdx < 12 ? hrIdx : markerIdx;
        const before = fullText.slice(0, cutAt);
        const lastBreak = fullText.indexOf('\n---', markerIdx);
        const tailStart = lastBreak >= 0 ? fullText.indexOf('\n', lastBreak + 1) : -1;
        const after = tailStart >= 0 ? fullText.slice(tailStart + 1) : '';
        return before.trimEnd() + summary.block + (after ? '\n' + after.trimStart() : '');
      }
    }
    return fullText.replace(/\s*$/, '') + summary.block;
  }

  async insertSummary(text, tags, opts) {
    opts = opts || {};
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return null;
    const editor = view.editor;
    const fullText = editor.getValue();
    const summary = buildSummaryBlock(
      text,
      tags,
      resolveWriteMode(this.settings.summaryMode || 'replace-latest')
    );
    const nextValue = this.buildNextDocument(fullText, summary);
    const tail = (s) => {
      const lines = String(s).split('\n');
      return lines.slice(Math.max(0, lines.length - 24)).join('\n');
    };

    const apply = () => {
      editor.setValue(nextValue);
      const line = editor.lastLine();
      editor.setCursor({ line, ch: 0 });
      editor.scrollIntoView({ from: { line: Math.max(0, line - 4), ch: 0 }, to: { line, ch: 0 } }, true);
      return { line };
    };

    if (opts.confirm && this.settings.previewBeforeApply !== false) {
      return await new Promise((resolve) => {
        new SummaryDiffModal(this.app, this, {
          beforeText: tail(fullText),
          afterText: tail(nextValue),
          onApply: () => resolve(apply()),
          onCancel: () => resolve(null),
        }).open();
      });
    }

    return apply();
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
