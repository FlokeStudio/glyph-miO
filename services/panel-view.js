const { ItemView, MarkdownView } = require('obsidian');
const { t, reasonLabel } = require('./i18n');
const { extractiveSummary } = require('./summary');

const VIEW_TYPE = 'glyph-mi-o-panel';

function formatTagTooltip(detail, lang, vaultFreq) {
  if (!detail) return '';
  const pct = Math.round((detail.relevance != null ? detail.relevance : 0) * 100);
  const reasons = (detail.reasons || [])
    .map((r) => reasonLabel(r, lang))
    .join(', ');
  let tip = t('relevanceTitle', lang) + ': ' + pct + '%' + (reasons ? ' — ' + reasons : '');
  if (vaultFreq != null && vaultFreq > 0) {
    tip += ' · ' + t('vaultFreq', lang) + ': ' + vaultFreq;
  }
  return tip;
}

function mountGlyphMiOPanel(rootEl, plugin) {
  const lang = plugin.lang();
  rootEl.addClass('glyph-mi-o-view');
  rootEl.createEl('h2', { text: t('panelTitle', lang) + ' 2.8' });
  rootEl.createEl('p', {
    cls: 'glyph-mio-lead',
    text: t('panelLead', lang),
  });

  const ollamaStatusEl = rootEl.createEl('div', { cls: 'glyph-mio-ollama-status' });
  const statsEl = rootEl.createEl('div', { cls: 'glyph-mio-stats' });
  const tagsEl = rootEl.createEl('div', { cls: 'glyph-mio-tags' });
  const actions = rootEl.createEl('div', { cls: 'glyph-mio-actions' });
  const summaryPreviewEl = rootEl.createEl('div', { cls: 'glyph-mio-summary-preview' });
  const summaryStatusEl = rootEl.createEl('p', { cls: 'glyph-mio-summary-status' });
  rootEl.createEl('p', {
    cls: 'glyph-mio-help',
    text: t('help', lang),
  });

  const state = { _meta: null, _previewSummary: '' };

  async function refreshOllamaBadge() {
    const badgeLang = plugin.lang();
    const ollamaState = await plugin.getOllamaState();
    ollamaStatusEl.empty();
    const el = ollamaStatusEl.createEl('span', {
      cls: 'glyph-mio-status-pill glyph-mio-status-' + ollamaState.kind,
      text: ollamaState.label,
    });
    el.setAttr('title', ollamaState.detail || ollamaState.label);
    return badgeLang;
  }

  async function refresh() {
    const refreshLang = plugin.lang();
    await refreshOllamaBadge();
    const doc = await plugin.readActive();
    if (!doc) {
      statsEl.setText(t('openNote', refreshLang));
      tagsEl.empty();
      summaryPreviewEl.empty();
      return;
    }
    const meta = plugin.algorithmicMeta(doc.file, doc.body, doc.cache);
    state._meta = meta;
    statsEl.empty();
    statsEl.createEl('div', { text: 'Title: ' + meta.title });
    statsEl.createEl('div', { text: 'Words: ' + meta.wordCount + ' · Links: ' + meta.links });
    if (meta.headings.length) {
      statsEl.createEl('div', { text: 'Headings: ' + meta.headings.slice(0, 5).join(' · ') });
    }

    tagsEl.empty();
    const details = meta.tagDetails || meta.tags.map((tag) => ({ tag, relevance: 0.5, reasons: ['body'] }));
    details.forEach((detail) => {
      const tag = detail.tag || detail;
      const pct = Math.round((detail.relevance != null ? detail.relevance : 0.5) * 100);
      const vaultFreq = plugin.vaultCache ? plugin.vaultCache.tagFrequency(tag) : 0;
      const chip = tagsEl.createEl('button', {
        cls: 'glyph-mio-tag',
        text: '#' + tag + ' · ' + pct + '%',
      });
      chip.setAttr('title', formatTagTooltip(detail, refreshLang, vaultFreq));
      chip.addEventListener('click', () => {
        const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        const pos = view.editor.getCursor();
        view.editor.replaceRange('#' + tag + ' ', pos);
      });
    });

    const preview = meta.summaryPreview || extractiveSummary(doc.body, meta);
    state._previewSummary = preview;
    summaryPreviewEl.empty();
    summaryPreviewEl.createEl('div', {
      cls: 'glyph-mio-preview-label',
      text: t('previewLabel', refreshLang),
    });
    summaryPreviewEl.createEl('div', { cls: 'glyph-mio-preview-text', text: preview });
  }

  function copyTags() {
    const copyLang = plugin.lang();
    if (!state._meta || !state._meta.tags.length) {
      const { Notice } = require('obsidian');
      new Notice(t('noTags', copyLang));
      return;
    }
    const line = state._meta.tags.map((x) => '#' + x).join(' ');
    navigator.clipboard.writeText(line);
    const { Notice } = require('obsidian');
    new Notice(t('tagsCopied', copyLang));
  }

  async function insertFromPanel() {
    const ok = await plugin.summarizeNote({ fromPanel: true, forceInsert: true });
    if (ok && summaryStatusEl) {
      summaryStatusEl.setText(
        t('summaryApplied', plugin.lang()) +
          ' «' +
          ok.title +
          '»' +
          (ok.line != null ? ' (~' + ok.line + ', ' + ok.mode + ')' : ' (' + ok.mode + ')')
      );
    }
    await refreshOllamaBadge();
  }

  actions.createEl('button', { text: t('analyze', lang), cls: 'mod-cta' }).addEventListener('click', () => {
    refresh();
  });
  actions.createEl('button', { text: t('insertSummary', lang) }).addEventListener('click', () => {
    insertFromPanel();
  });
  actions.createEl('button', { text: t('goToSummary', lang) }).addEventListener('click', () => {
    plugin.jumpToSummary();
  });
  actions.createEl('button', { text: t('copyTags', lang) }).addEventListener('click', () => {
    copyTags();
  });

  return {
    refresh,
    refreshOllamaBadge,
    copyTags,
    insertFromPanel,
    state,
    ollamaStatusEl,
  };
}

class GlyphMiOPanelView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.panel = null;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return t('panelTitle', this.plugin.lang());
  }

  getIcon() {
    return 'sparkles';
  }

  async onOpen() {
    this.panel = mountGlyphMiOPanel(this.containerEl, this.plugin);
    await this.panel.refresh();
  }

  async onClose() {
    this.containerEl.empty();
    this.panel = null;
  }
}

module.exports = {
  VIEW_TYPE,
  GlyphMiOPanelView,
  mountGlyphMiOPanel,
  formatTagTooltip,
};
