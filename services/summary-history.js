const MAX_HISTORY = 10;

function loadHistory(plugin) {
  return Array.isArray(plugin.settings.summaryHistory) ? plugin.settings.summaryHistory : [];
}

async function pushHistory(plugin, entry) {
  const history = loadHistory(plugin);
  history.unshift({
    timestamp: entry.timestamp != null ? entry.timestamp : Date.now(),
    path: String(entry.path || ''),
    snippet: String(entry.snippet || '').slice(0, 240),
    fullText: String(entry.fullText || ''),
  });
  plugin.settings.summaryHistory = history.slice(0, MAX_HISTORY);
  await plugin.saveSettings();
}

async function rollbackLast(app, plugin) {
  const history = loadHistory(plugin);
  if (!history.length) return { ok: false, reason: 'empty' };

  const last = history[0];
  const file = app.vault.getAbstractFileByPath(last.path);
  if (!file) {
    plugin.settings.summaryHistory = history.slice(1);
    await plugin.saveSettings();
    return { ok: false, reason: 'missing-file', path: last.path };
  }

  await app.vault.modify(file, last.fullText);
  plugin.settings.summaryHistory = history.slice(1);
  await plugin.saveSettings();
  return { ok: true, path: last.path };
}

module.exports = {
  MAX_HISTORY,
  loadHistory,
  pushHistory,
  rollbackLast,
};
