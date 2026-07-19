/**
 * Thin adapter toward shared glyph-mi `notes` module.
 *
 * glyph-mi now ships:
 *   ../glyph-mi/js/modules/notes/index.js  → analyzeForNotes / NOTES_MODULE_MANIFEST
 *   ../glyph-mi/js/universal/engine.js     → MODULE_HANDLERS.notes / analyzeUniversal
 *
 * Contract (normalizeInput → pipeline → normalizeResult) exposes confidence + sources.
 * Obsidian plugin stays CommonJS and offline-first: we do NOT require ESM glyph-mi at
 * runtime yet (would need a vendored CJS build). Local services/* remain the live path.
 *
 * TODO(glyph-mi notes):
 * 1. Vendor or bundle `analyzeForNotes` / `analyzeUniversal({ moduleId: 'notes', note })`
 * 2. Map TFile + body + cache → { note: { title, body, headings, frontTags }, track: { path } }
 * 3. Merge result.confidence / result.sources / result.fields into tagDetails + panel
 * 4. On module missing / throw → keep analyzeNote() local fallback (hints.fallbackReason)
 *
 * Shared styling goal: glyph-ui kit with glyph-sO (panel chrome, status pills).
 */

const { computeMetadataCached } = require('./metadata');
const { extractiveSummary } = require('./summary');

/** Documented entry points once a CJS/vendor build exists beside the plugin. */
const GLYPH_MI_NOTES_HINT = {
  moduleId: 'notes',
  sourceRepo: 'https://github.com/krwg/glyph-mi',
  modulePath: 'js/modules/notes/index.js',
  exportName: 'analyzeForNotes',
  engine: 'js/universal/engine.js → analyzeUniversal({ moduleId: "notes" })',
};

/**
 * @returns {{ available: boolean, moduleId: string|null, reason: string, hint: object }}
 */
function detectNotesModule() {
  // Runtime require of ESM glyph-mi is intentionally skipped until vendored.
  return {
    available: false,
    moduleId: null,
    reason:
      'glyph-mi notes exists upstream but is not vendored into glyph-miO yet; using local services/*',
    hint: GLYPH_MI_NOTES_HINT,
  };
}

/**
 * Analyze a note. Always uses local offline services for now.
 * Future: prefer glyph-mi notes, merge confidence/sources, fall back locally.
 *
 * @param {object} file Obsidian TFile-like
 * @param {string} body
 * @param {object} cache metadataCache entry
 * @param {object} runtime { cache?: Map }
 */
function analyzeNote(file, body, cache, runtime) {
  const bridge = detectNotesModule();
  // TODO: if (bridge.available) {
  //   const result = await analyzeForNotes({ note: {...}, track: { path: file.path } });
  //   return mapNotesResult(result, /* local fallback meta */);
  // }
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
