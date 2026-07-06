const STOP_WORDS = new Set([
  'the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'note', 'tags', 'and', 'for',
  'для', 'как', 'это', 'при', 'что', 'или', 'эта', 'этот', 'того', 'быть', 'были', 'может',
  'также', 'через', 'после', 'если', 'когда', 'только', 'уже', 'все', 'всё', 'его', 'ее', 'её',
]);

function keyForDoc(file, body) {
  const mtime = file?.stat?.mtime || 0;
  return `${file?.path || 'note'}|${mtime}|${String(body || '').length}`;
}

function scoreFromSignals(word, freq, headingWords, linkCount) {
  let score = freq * 2;
  if (headingWords.has(word)) score += 10;
  if (linkCount > 6) score += 1;
  return score;
}

function computeMetadata(file, body, cache, runtime = {}) {
  const words = String(body || '').toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || [];
  const freq = new Map();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const headings = (cache?.headings || []).map((h) => h.heading).slice(0, 10);
  const headingWords = new Set(
    headings
      .join(' ')
      .toLowerCase()
      .match(/[a-z0-9а-яё]{4,}/g) || []
  );
  const links = cache?.links ? cache.links.length : 0;
  const scored = [...freq.entries()]
    .map(([word, raw]) => [word, scoreFromSignals(word, raw, headingWords, links)])
    .sort((a, b) => b[1] - a[1]);

  let frontTags = [];
  const rawTags = cache?.frontmatter?.tags;
  if (Array.isArray(rawTags)) frontTags = rawTags.map(String);
  else if (rawTags != null && rawTags !== '') frontTags = [String(rawTags)];

  const meta = {
    title: String(file?.basename || '').replace(/\.md$/i, ''),
    tags: [...new Set([...frontTags, ...scored.map(([word]) => word)])].slice(0, 12),
    headings,
    links,
    wordCount: words.length,
  };

  if (runtime.cache) runtime.cache.set(keyForDoc(file, body), meta);
  return meta;
}

function computeMetadataCached(file, body, cache, runtime = {}) {
  const key = keyForDoc(file, body);
  if (runtime.cache && runtime.cache.has(key)) return runtime.cache.get(key);
  return computeMetadata(file, body, cache, runtime);
}

module.exports = {
  keyForDoc,
  computeMetadata,
  computeMetadataCached,
};
