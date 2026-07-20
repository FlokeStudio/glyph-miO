const { computeMetadataCached } = require('./metadata');
const { extractiveSummary } = require('./summary');

const GLYPH_MI_NOTES_HINT = {
  moduleId: 'notes',
  sourceRepo: 'https://github.com/krwg/glyph-mi',
  modulePath: 'js/modules/notes/index.js',
  exportName: 'analyzeForNotes',
};

let notesVendor = null;

function loadNotesVendor() {
  if (notesVendor) return notesVendor;
  try {
    notesVendor = require('../vendor/glyph-mi-notes.cjs');
    return notesVendor;
  } catch {
    return null;
  }
}

function detectNotesModule() {
  const mod = loadNotesVendor();
  if (mod && typeof mod.analyzeNotesPipeline === 'function') {
    return {
      available: true,
      moduleId: 'notes',
      reason: 'glyph-mi notes vendored',
      hint: GLYPH_MI_NOTES_HINT,
    };
  }
  return {
    available: false,
    moduleId: null,
    reason: 'glyph-mi notes vendor missing; using local services',
    hint: GLYPH_MI_NOTES_HINT,
  };
}

/** Read YAML frontmatter tags from Obsidian CachedMetadata (not a Map). */
function frontTagsFromCache(cache) {
  const rawTags = cache?.frontmatter?.tags;
  if (Array.isArray(rawTags)) return rawTags.map(String);
  if (rawTags != null && rawTags !== '') return [String(rawTags)];
  return [];
}

function mapVendorToMeta(vendorResult, file) {
  const fields = vendorResult.fields || {};
  const tagDetails = (fields.tagScores || []).map((row) => ({
    tag: row.tag,
    relevance: Math.min(1, row.score / 20),
    reasons: ['glyph-mi-notes'],
  }));
  return {
    tags: fields.tags || [],
    tagDetails,
    summary: fields.summary || '',
    wordCount: fields.wordCount || 0,
    linkCount: fields.linkCount || 0,
    title: fields.title || file?.basename || '',
  };
}

function analyzeNote(file, body, cache, runtime) {
  const bridge = detectNotesModule();
  const mod = loadNotesVendor();

  if (bridge.available && mod) {
    const frontTags = frontTagsFromCache(cache);
    const vendor = mod.analyzeNotesPipeline({
      title: file?.basename?.replace(/\.md$/i, '') || '',
      body: body || '',
      path: file?.path || '',
      frontTags,
      headings: mod.extractHeadingsFromBody ? mod.extractHeadingsFromBody(body) : [],
    });
    const meta = mapVendorToMeta(vendor, file);
    return {
      ...meta,
      provider: 'glyph-mi/notes',
      hints: { integrated: true, glyphMiNotes: bridge.hint },
      confidence: vendor.confidence || {
        score: 0,
        reasons: [],
      },
      sources: vendor.sources || ['glyph-mi-notes'],
      summaryPreview: vendor.fields?.summary || extractiveSummary(body, meta),
    };
  }

  const meta = computeMetadataCached(file, body, cache, runtime || {});
  return {
    ...meta,
    provider: 'glyph-miO/local',
    hints: {
      fallbackReason: bridge.reason,
      glyphMiNotes: bridge.hint,
    },
    confidence: {
      score:
        meta.tagDetails && meta.tagDetails[0]
          ? Math.round(meta.tagDetails[0].relevance * 100)
          : 0,
      reasons: (meta.tagDetails || []).slice(0, 3).flatMap((d) => d.reasons || []),
    },
    sources: ['local-metadata'],
    summaryPreview: extractiveSummary(body, meta),
  };
}

module.exports = {
  GLYPH_MI_NOTES_HINT,
  detectNotesModule,
  frontTagsFromCache,
  analyzeNote,
};
