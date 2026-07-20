const { keyForDoc } = require('./metadata');

const DEBOUNCE_MS = 400;

function tagsFromCache(cache) {
  const raw = cache?.frontmatter?.tags;
  if (Array.isArray(raw)) return raw.map(String);
  if (raw != null && raw !== '') return [String(raw)];
  const inline = (cache?.tags || []).map((t) => String(t.tag || t).replace(/^#/, ''));
  return inline;
}

function wordCountFromBody(body) {
  const words = String(body || '').match(/[a-z0-9а-яё]{2,}/gi);
  return words ? words.length : 0;
}

class VaultCache {
  constructor(plugin) {
    this.plugin = plugin;
    this.index = new Map();
    this._debounceTimer = null;
    this._rebuilding = false;
  }

  async load() {
    const stored = await this.plugin.loadData();
    const raw = stored && stored.vaultCache ? stored.vaultCache : {};
    this.index = new Map(Object.entries(raw));
  }

  async save() {
    const stored = (await this.plugin.loadData()) || {};
    stored.vaultCache = Object.fromEntries(this.index);
    await this.plugin.saveData(stored);
  }

  entryForPath(path) {
    return this.index.get(path) || null;
  }

  tagFrequency(tag) {
    const needle = String(tag).replace(/^#/, '').toLowerCase();
    let count = 0;
    for (const entry of this.index.values()) {
      if ((entry.tags || []).some((t) => String(t).toLowerCase() === needle)) count++;
    }
    return count;
  }

  scheduleRebuild() {
    if (this._debounceTimer) window.clearTimeout(this._debounceTimer);
    this._debounceTimer = window.setTimeout(() => {
      this.rebuild().catch(() => {});
    }, DEBOUNCE_MS);
  }

  bindVaultEvents() {
    const vault = this.plugin.app.vault;
    const meta = this.plugin.app.metadataCache;
    const schedule = () => this.scheduleRebuild();

    this.plugin.registerEvent(vault.on('create', schedule));
    this.plugin.registerEvent(vault.on('delete', schedule));
    this.plugin.registerEvent(vault.on('rename', schedule));
    this.plugin.registerEvent(vault.on('modify', schedule));
    this.plugin.registerEvent(meta.on('changed', schedule));
  }

  async indexFile(file) {
    if (!file || file.extension !== 'md') return;
    const app = this.plugin.app;
    const body = await app.vault.cachedRead(file);
    const cache = app.metadataCache.getFileCache(file);
    this.index.set(file.path, {
      mtime: file.stat?.mtime != null ? Number(file.stat.mtime) : 0,
      tags: tagsFromCache(cache),
      title: String(file.basename || '').replace(/\.md$/i, ''),
      wordCount: wordCountFromBody(body),
      cacheKey: keyForDoc(file, body),
    });
  }

  async rebuild() {
    if (this._rebuilding) return;
    this._rebuilding = true;
    try {
      const files = this.plugin.app.vault.getMarkdownFiles();
      const seen = new Set();
      for (const file of files) {
        seen.add(file.path);
        await this.indexFile(file);
      }
      for (const path of [...this.index.keys()]) {
        if (!seen.has(path)) this.index.delete(path);
      }
      await this.save();
    } finally {
      this._rebuilding = false;
    }
  }
}

module.exports = {
  VaultCache,
  tagsFromCache,
  wordCountFromBody,
};
