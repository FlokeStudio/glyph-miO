const STOP_WORDS = new Set([
  'the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'note', 'tags', 'and', 'for',
  'для', 'как', 'это', 'при', 'что', 'или', 'эта', 'этот', 'того', 'быть', 'были', 'может',
  'также', 'через', 'после', 'если', 'когда', 'только', 'уже', 'все', 'всё', 'его', 'ее', 'её',
]);

function contentHash(body) {
  const s = String(body || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function keyForDoc(file, body) {
  const path = String(file?.path || '').trim() || '__unnamed__';
  const mtime = file?.stat?.mtime != null ? Number(file.stat.mtime) : 0;
  const size =
    file?.stat?.size != null ? Number(file.stat.size) : String(body || '').length;
  return `${path}|${mtime}|${size}|${contentHash(body)}`;
}

function scoreFromSignals(word, freq, headingWords, titleWords, linkCount) {
  let score = freq * 2;
  if (titleWords.has(word)) score += 16;
  if (headingWords.has(word)) score += 10;
  if (linkCount > 6) score += 1;
  return score;
}

function reasonsForWord(word, titleWords, headingWords, bodyFreq) {
  const reasons = [];
  if (titleWords.has(word)) reasons.push('title');
  if (headingWords.has(word)) reasons.push('heading');
  if ((bodyFreq.get(word) || 0) > 0) reasons.push('body');
  return reasons.length ? reasons : ['body'];
}

function computeMetadata(file, body, cache, runtime = {}) {
  const words = String(body || '').toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || [];
  const freq = new Map();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const titleRaw = String(file?.basename || '').replace(/\.md$/i, '');
  const titleWords = new Set(titleRaw.toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || []);
  const headings = (cache?.headings || []).map((h) => h.heading).slice(0, 10);
  const headingWords = new Set(
    headings
      .join(' ')
      .toLowerCase()
      .match(/[a-z0-9а-яё]{4,}/g) || []
  );
  const links = cache?.links ? cache.links.length : 0;
  const scored = [...freq.entries()]
    .map(([word, raw]) => [
      word,
      scoreFromSignals(word, raw, headingWords, titleWords, links),
    ])
    .sort((a, b) => b[1] - a[1]);

  let frontTags = [];
  const rawTags = cache?.frontmatter?.tags;
  if (Array.isArray(rawTags)) frontTags = rawTags.map(String);
  else if (rawTags != null && rawTags !== '') frontTags = [String(rawTags)];

  const maxScore = scored.length ? scored[0][1] : 1;
  const tagDetails = [];
  const seen = new Set();

  for (const t of frontTags) {
    const word = String(t).replace(/^#/, '').toLowerCase();
    if (!word || seen.has(word)) continue;
    seen.add(word);
    tagDetails.push({
      tag: word,
      score: 100,
      reasons: ['frontmatter'],
      relevance: 1,
    });
  }

  for (const [word, score] of scored) {
    if (seen.has(word)) continue;
    seen.add(word);
    const reasons = reasonsForWord(word, titleWords, headingWords, freq);
    tagDetails.push({
      tag: word,
      score,
      reasons,
      relevance: Math.max(0.05, Math.min(1, score / Math.max(maxScore, 1))),
    });
    if (tagDetails.length >= 12) break;
  }

  const meta = {
    title: titleRaw,
    tags: tagDetails.map((t) => t.tag),
    tagDetails,
    headings,
    links,
    wordCount: words.length,
    cacheKey: keyForDoc(file, body),
  };

  if (runtime.cache) runtime.cache.set(meta.cacheKey, meta);
  return meta;
}

function computeMetadataCached(file, body, cache, runtime = {}) {
  const key = keyForDoc(file, body);
  if (runtime.cache && runtime.cache.has(key)) return runtime.cache.get(key);
  return computeMetadata(file, body, cache, runtime);
}

module.exports = {
  keyForDoc,
  contentHash,
  computeMetadata,
  computeMetadataCached,
};
