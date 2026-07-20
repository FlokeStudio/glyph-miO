'use strict';

const STOP_WORDS = new Set([
  'the', 'that', 'this', 'with', 'from', 'have', 'will', 'your', 'note', 'tags', 'and', 'for',
  'для', 'как', 'это', 'при', 'что', 'или', 'эта', 'этот', 'того', 'быть', 'были', 'может',
  'также', 'через', 'после', 'если', 'когда', 'только', 'уже', 'все', 'всё', 'его', 'ее', 'её',
]);

function extractHeadingsFromBody(body) {
  const lines = String(body || '').split(/\r?\n/);
  const headings = [];
  for (const line of lines) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (m) headings.push(m[1].trim());
  }
  return headings.slice(0, 10);
}

function countWikiLinks(body) {
  const matches = String(body || '').match(/\[\[[^\]]+\]\]/g);
  return matches ? matches.length : 0;
}

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
  return out.length ? out : [String(text || '').trim()].filter(Boolean);
}

function extractiveSummary(body, headings) {
  const plain = stripForSummary(body);
  if (!plain) return '';
  const headingList = Array.isArray(headings) ? headings : [];
  const sentences = splitSentences(plain);
  if (sentences.length <= 2) return sentences.join(' ');
  const words = plain.toLowerCase().match(/[a-zа-яё0-9]{4,}/gi) || [];
  const freq = new Map();
  for (const word of words) freq.set(word, (freq.get(word) || 0) + 1);
  for (const heading of headingList) {
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
  return scored.slice(0, 4).sort((a, b) => a.i - b.i).map((x) => x.sentence).join(' ');
}

function scoreTags(opts) {
  const title = opts.title || '';
  const headings = opts.headings || [];
  const body = opts.body || '';
  const frontTags = opts.frontTags || [];
  const words = String(body).toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || [];
  const freq = new Map();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  const headingWords = new Set(
    headings.join(' ').toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || []
  );
  const titleWords = String(title).toLowerCase().match(/[a-z0-9а-яё]{4,}/g) || [];
  for (const w of titleWords) {
    if (!STOP_WORDS.has(w)) headingWords.add(w);
  }
  const linkCount = countWikiLinks(body);
  const scored = [...freq.entries()]
    .map(([word, raw]) => ({
      tag: word,
      score: raw * 2 + (headingWords.has(word) ? 10 : 0) + (linkCount > 6 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  const front = frontTags.map(String).map((t) => t.replace(/^#/, '').trim()).filter(Boolean);
  const tags = [...new Set([...front, ...scored.map((s) => s.tag)])].slice(0, 12);
  return { tags, tagScores: scored.slice(0, 12), wordCount: words.length, linkCount };
}

function analyzeNotesPipeline(opts) {
  opts = opts || {};
  const body = opts.body || '';
  const resolvedHeadings =
    Array.isArray(opts.headings) && opts.headings.length
      ? opts.headings.slice(0, 10)
      : extractHeadingsFromBody(body);
  const resolvedTitle =
    String(opts.title || '').trim() ||
    String(opts.path || '').split(/[/\\]/).pop()?.replace(/\.md$/i, '') ||
    '';
  const { tags, tagScores, wordCount, linkCount } = scoreTags({
    title: resolvedTitle,
    headings: resolvedHeadings,
    body,
    frontTags: opts.frontTags || [],
  });
  const summary = extractiveSummary(body, resolvedHeadings);
  const reasons = [];
  if (resolvedTitle) reasons.push('notes: title resolved');
  if (resolvedHeadings.length) reasons.push(`notes: ${resolvedHeadings.length} heading(s)`);
  if (tags.length) reasons.push(`notes: ${tags.length} tag candidate(s)`);
  if (summary) reasons.push('notes: extractive summary');
  let score = 15;
  if (resolvedTitle) score += 20;
  if (resolvedHeadings.length) score += Math.min(20, resolvedHeadings.length * 4);
  if (tags.length) score += Math.min(25, tags.length * 3);
  if (summary) score += 15;
  if (wordCount > 40) score += 5;
  score = Math.max(0, Math.min(100, score));
  let level = 'low';
  if (score >= 72) level = 'high';
  else if (score >= 48) level = 'medium';
  return {
    fields: {
      title: resolvedTitle,
      headings: resolvedHeadings,
      body: String(body),
      tags,
      tagScores,
      summary,
      wordCount,
      linkCount,
    },
    confidence: { score, level, reasons },
    sources: ['glyph-mi-notes'],
  };
}

module.exports = {
  analyzeNotesPipeline,
  extractiveSummary,
  extractHeadingsFromBody,
};
