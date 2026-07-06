const SUMMARY_MARKER = '<!-- glyph-miO-summary -->';

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
  const out = String(text || '')
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 18);
  return out.length ? out : [String(text || '').trim()];
}

function extractiveSummary(body, meta) {
  const plain = stripForSummary(body);
  if (!plain) return 'Заметка пуста — нечего пересказывать.';
  const sentences = splitSentences(plain);
  if (sentences.length <= 2) return sentences.join(' ');

  const words = plain.toLowerCase().match(/[a-zа-яё0-9]{4,}/gi) || [];
  const freq = new Map();
  for (const word of words) freq.set(word, (freq.get(word) || 0) + 1);
  for (const heading of meta.headings || []) {
    for (const word of String(heading).toLowerCase().split(/\s+/)) {
      if (word.length > 3) freq.set(word, (freq.get(word) || 0) + 8);
    }
  }
  const scored = sentences.map((sentence, i) => {
    const sw = sentence.toLowerCase().match(/[a-zа-яё0-9]{4,}/gi) || [];
    let score = i < 2 ? 3 : 0;
    for (const word of sw) score += freq.get(word) || 0;
    return { sentence, score, i };
  });
  scored.sort((a, b) => b.score - a.score);
  const picked = scored.slice(0, 4).sort((a, b) => a.i - b.i);
  return picked.map((x) => x.sentence).join(' ');
}

function buildSummaryBlock(text, tags, mode = 'append') {
  const tagLine = tags.length ? '\n' + tags.map((t) => '#' + String(t).replace(/^#/, '')).join(' ') + '\n' : '\n';
  const body =
    '\n\n---\n' +
    SUMMARY_MARKER +
    '\n> [!summary] Glyph MI-O\n> ' +
    String(text || '').replace(/\n/g, '\n> ') +
    '\n';
  return { block: body + tagLine, marker: SUMMARY_MARKER, mode };
}

module.exports = {
  SUMMARY_MARKER,
  stripForSummary,
  splitSentences,
  extractiveSummary,
  buildSummaryBlock,
};
