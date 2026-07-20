const STRINGS = {
  en: {
    panelTitle: 'glyph-miO',
    panelLead: 'Metadata Intelligence for the active note — offline; Ollama optional for summaries.',
    analyze: 'Analyze',
    insertSummary: 'Insert summary',
    goToSummary: 'Go to summary',
    copyTags: 'Copy #tags',
    previewLabel: 'Summary draft:',
    help:
      'Insert summary — short retelling at the end of the note (callout). Analyze first, then insert. Go to summary jumps to the block.',
    settingsTitle: 'Glyph MI-O',
    enableOllama: 'Enable Ollama',
    enableOllamaDesc: 'Optional local LLM for summaries (algorithmic mode works without it).',
    ollamaUrl: 'Ollama URL',
    ollamaModel: 'Model',
    ollamaTimeout: 'Ollama timeout (seconds)',
    ollamaTimeoutDesc: 'Abort generation after this many seconds (default 12). Falls back to offline summary.',
    summaryMode: 'Summary block mode',
    summaryModeDesc:
      'append: add a new block. replace-latest: update the latest block. none/off: preview only — do not auto-write; insert via panel button or when you confirm.',
    previewBeforeApply: 'Diff preview before Apply',
    previewBeforeApplyDesc: 'Show a before/after modal before inserting or replacing a summary block.',
    tagWriteMode: 'Tag write mode',
    tagWriteModeDesc: 'inline: #tags in the note body. frontmatter: merge into YAML tags array.',
    panelMode: 'Panel mode',
    panelModeDesc: 'sidebar: dock in the right rail. modal: legacy centered modal.',
    cmdPanel: 'Glyph: open MI panel',
    cmdAnalyze: 'Glyph: analyze active note',
    cmdAnalyzeVault: 'Glyph: analyze vault',
    cmdTags: 'Glyph: suggest tags',
    cmdSummarize: 'Glyph: summarize note',
    cmdJump: 'Glyph: jump to MI summary',
    cmdRollback: 'Glyph: rollback last summary',
    statusOllamaOn: 'MI · Ollama',
    statusOllamaOff: 'MI · offline',
    statusOllamaDisabled: 'MI · Ollama off',
    diffTitle: 'Apply summary?',
    diffApply: 'Apply',
    diffCancel: 'Cancel',
    diffBefore: 'Current note (tail)',
    diffAfter: 'After insert / replace',
    relevanceTitle: 'Relevance',
    vaultFreq: 'Vault uses',
    reasonTitle: 'title',
    reasonHeading: 'heading',
    reasonBody: 'body',
    reasonFrontmatter: 'frontmatter',
    previewOnlyNotice: 'Summary mode is none/off — draft only (not written). Use Insert summary to apply.',
    openNote: 'Open a markdown note first.',
    noTags: 'No tags',
    tagsCopied: 'Tags copied',
    summaryApplied: 'Summary applied →',
    vaultAnalyzeDone: 'Vault: {total} notes · {untagged} untagged · {suggestions} suggestions',
    rollbackOk: 'Rolled back summary for',
    rollbackEmpty: 'No summary history to rollback',
    rollbackMissing: 'Could not rollback — file missing',
  },
  ru: {
    panelTitle: 'glyph-miO',
    panelLead: 'Metadata Intelligence для активной заметки — офлайн; Ollama опционально для пересказа.',
    analyze: 'Анализ',
    insertSummary: 'Вставить пересказ',
    goToSummary: 'К саммари',
    copyTags: 'Копировать #теги',
    previewLabel: 'Черновик пересказа:',
    help:
      '«Вставить пересказ» — краткий пересказ в конце заметки (callout). Сначала Анализ, затем вставка. «К саммари» — перейти к блоку.',
    settingsTitle: 'Glyph MI-O',
    enableOllama: 'Включить Ollama',
    enableOllamaDesc: 'Локальная LLM для пересказа (алгоритмический режим работает без неё).',
    ollamaUrl: 'URL Ollama',
    ollamaModel: 'Модель',
    ollamaTimeout: 'Таймаут Ollama (секунды)',
    ollamaTimeoutDesc: 'Прервать генерацию через N секунд (по умолчанию 12). Дальше — офлайн-пересказ.',
    summaryMode: 'Режим блока саммари',
    summaryModeDesc:
      'append: добавить новый блок. replace-latest: обновить последний. none/off: только черновик — не писать в файл автоматически; вставка кнопкой или с подтверждением.',
    previewBeforeApply: 'Превью diff перед Apply',
    previewBeforeApplyDesc: 'Показать модалку до/после перед вставкой или заменой блока саммари.',
    tagWriteMode: 'Режим записи тегов',
    tagWriteModeDesc: 'inline: #теги в тексте. frontmatter: массив tags в YAML.',
    panelMode: 'Режим панели',
    panelModeDesc: 'sidebar: боковая панель. modal: прежнее модальное окно.',
    cmdPanel: 'Glyph: открыть панель MI',
    cmdAnalyze: 'Glyph: анализ активной заметки',
    cmdAnalyzeVault: 'Glyph: анализ vault',
    cmdTags: 'Glyph: предложить теги',
    cmdSummarize: 'Glyph: пересказ заметки',
    cmdJump: 'Glyph: перейти к саммари MI',
    cmdRollback: 'Glyph: откатить последний пересказ',
    statusOllamaOn: 'MI · Ollama',
    statusOllamaOff: 'MI · офлайн',
    statusOllamaDisabled: 'MI · Ollama выкл.',
    diffTitle: 'Применить пересказ?',
    diffApply: 'Применить',
    diffCancel: 'Отмена',
    diffBefore: 'Сейчас (хвост заметки)',
    diffAfter: 'После вставки / замены',
    relevanceTitle: 'Релевантность',
    vaultFreq: 'В vault',
    reasonTitle: 'заголовок',
    reasonHeading: 'раздел',
    reasonBody: 'текст',
    reasonFrontmatter: 'frontmatter',
    previewOnlyNotice: 'Режим none/off — только черновик (в файл не пишется). Вставьте через «Вставить пересказ».',
    openNote: 'Сначала откройте markdown-заметку.',
    noTags: 'Нет тегов',
    tagsCopied: 'Теги скопированы',
    summaryApplied: 'Пересказ →',
    vaultAnalyzeDone: 'Vault: {total} заметок · {untagged} без тегов · {suggestions} предложений',
    rollbackOk: 'Откат пересказа для',
    rollbackEmpty: 'Нет истории пересказов',
    rollbackMissing: 'Откат невозможен — файл не найден',
  },
};

function detectLang() {
  try {
    const obsidian = require('obsidian');
    if (typeof obsidian.getLanguage === 'function') {
      const lang = String(obsidian.getLanguage() || 'en').toLowerCase();
      return lang.startsWith('ru') ? 'ru' : 'en';
    }
  } catch (e) {
    void e;
  }
  try {
    const nav = typeof navigator !== 'undefined' ? navigator.language : '';
    if (String(nav).toLowerCase().startsWith('ru')) return 'ru';
  } catch (e) {
    void e;
  }
  return 'en';
}

function t(key, lang) {
  const locale = lang === 'ru' || lang === 'en' ? lang : detectLang();
  const pack = STRINGS[locale] || STRINGS.en;
  return pack[key] != null ? pack[key] : STRINGS.en[key] != null ? STRINGS.en[key] : key;
}

function reasonLabel(reason, lang) {
  const map = {
    title: 'reasonTitle',
    heading: 'reasonHeading',
    body: 'reasonBody',
    frontmatter: 'reasonFrontmatter',
  };
  return t(map[reason] || 'reasonBody', lang);
}

module.exports = {
  STRINGS,
  detectLang,
  t,
  reasonLabel,
};
