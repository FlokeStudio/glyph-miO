import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { normalizeTags, mergeTagArrays, applyTagsToFrontmatter } = require('./frontmatter.js');

describe('normalizeTags', () => {
  it('strips hashes and trims', () => {
    expect(normalizeTags(['#foo', ' bar ', '#baz'])).toEqual(['foo', 'bar', 'baz']);
  });

  it('wraps scalar values', () => {
    expect(normalizeTags('alpha')).toEqual(['alpha']);
  });
});

describe('mergeTagArrays', () => {
  it('merges without duplicates case-insensitively', () => {
    expect(mergeTagArrays(['Projects'], ['projects', 'new'])).toEqual(['Projects', 'new']);
  });
});

describe('applyTagsToFrontmatter', () => {
  let app;
  let file;

  beforeEach(() => {
    file = { path: 'note.md' };
    app = {
      fileManager: {
        processFrontMatter: vi.fn(async (_f, fn) => {
          const fm = { tags: ['existing'] };
          fn(fm);
          expect(fm.tags).toEqual(['existing', 'alpha', 'beta']);
        }),
      },
      workspace: {
        getActiveViewOfType: vi.fn(),
      },
    };
  });

  it('writes YAML tags in frontmatter mode', async () => {
    const ok = await applyTagsToFrontmatter(app, file, ['alpha', 'beta'], 'frontmatter');
    expect(ok).toBe(true);
    expect(app.fileManager.processFrontMatter).toHaveBeenCalledOnce();
  });

  it('returns false when inline mode has no active editor', async () => {
    app.workspace.activeLeaf = null;
    const ok = await applyTagsToFrontmatter(app, file, ['alpha'], 'inline');
    expect(ok).toBe(false);
  });
});
