import { describe, it, expect } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { analyzeNote, frontTagsFromCache } = require('./glyph-mi-notes-adapter.js');

describe('frontTagsFromCache', () => {
  it('reads array tags from CachedMetadata frontmatter', () => {
    expect(frontTagsFromCache({ frontmatter: { tags: ['alpha', '#beta'] } })).toEqual([
      'alpha',
      '#beta',
    ]);
  });

  it('wraps scalar frontmatter tags', () => {
    expect(frontTagsFromCache({ frontmatter: { tags: 'solo' } })).toEqual(['solo']);
  });

  it('returns empty when cache is missing or has no tags', () => {
    expect(frontTagsFromCache(null)).toEqual([]);
    expect(frontTagsFromCache({})).toEqual([]);
    expect(frontTagsFromCache({ frontmatter: {} })).toEqual([]);
  });

  it('does not treat cache as a Map', () => {
    const cache = { frontmatter: { tags: ['yaml-tag'] } };
    expect(() => frontTagsFromCache(cache)).not.toThrow();
    expect(typeof cache.get).toBe('undefined');
  });
});

describe('analyzeNote vendor path with CachedMetadata', () => {
  it('passes YAML frontmatter tags into vendor scoring', () => {
    const file = { path: 'notes/demo.md', basename: 'demo.md' };
    const body = 'This paragraph mentions projects and planning work for the week.';
    const cache = {
      frontmatter: { tags: ['yaml-priority', 'inbox'] },
      headings: [{ heading: 'Overview' }],
      links: [{ link: 'Other' }],
    };

    const result = analyzeNote(file, body, cache, {});

    expect(result.provider).toBe('glyph-mi/notes');
    expect(result.tags).toContain('yaml-priority');
    expect(result.tags).toContain('inbox');
  });

  it('still works when cache has no frontmatter', () => {
    const file = { path: 'a.md', basename: 'a.md' };
    const body = 'Simple note about gardening tools and soil.';
    const result = analyzeNote(file, body, {}, {});
    expect(result.provider).toBe('glyph-mi/notes');
    expect(Array.isArray(result.tags)).toBe(true);
  });
});
