const { tagsFromCache } = require('./vault-cache');

async function analyzeVault(app, plugin) {
  const files = app.vault.getMarkdownFiles();
  const total = files.length;
  let untagged = 0;
  const suggestions = [];

  for (const file of files) {
    const cache = app.metadataCache.getFileCache(file);
    const cached = plugin.vaultCache ? plugin.vaultCache.entryForPath(file.path) : null;
    const existing = cached && cached.tags && cached.tags.length
      ? cached.tags
      : tagsFromCache(cache);

    if (existing.length) continue;

    untagged++;
    const body = await app.vault.cachedRead(file);
    const meta = plugin.algorithmicMeta(file, body, cache);
    if (!meta.tags.length) continue;

    suggestions.push({
      path: file.path,
      title: meta.title,
      tags: meta.tags.slice(0, 6),
      tagDetails: (meta.tagDetails || []).slice(0, 6),
    });
  }

  return { total, untagged, suggestions };
}

module.exports = {
  analyzeVault,
};
