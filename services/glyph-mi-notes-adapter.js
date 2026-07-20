const { computeMetadataCached } = require('./metadata');
const { extractiveSummary } = require('./summary');

const GLYPH_MI_NOTES_HINT = {
  moduleId: 'notes',
  sourceRepo: 'https://github.com/krwg/glyph-mi',
  modulePath: 'js/modules/notes/index.js',
  exportName: 'analyzeForNotes',
};

function detectNotesModule() {
  return {
    available: false,
    moduleId: null,
    reason: 'glyph-mi notes not vendored; using local services',
    hint: GLYPH_MI_NOTES_HINT,
  };
}

function analyzeNote(file, body, cache, runtime) {
  const bridge = detectNotesModule();
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
  analyzeNote,
};
