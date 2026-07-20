import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { analyzeVault } = require('./batch-analyze.js');

describe('analyzeVault', () => {
  let app;
  let plugin;

  beforeEach(() => {
    const files = [
      { path: 'a.md', extension: 'md' },
      { path: 'b.md', extension: 'md' },
      { path: 'c.md', extension: 'md' },
    ];

    app = {
      vault: {
        getMarkdownFiles: () => files,
        cachedRead: vi.fn(async (file) => 'body for ' + file.path),
      },
      metadataCache: {
        getFileCache: (file) => {
          if (file.path === 'a.md') return { frontmatter: { tags: ['done'] } };
          if (file.path === 'b.md') return { frontmatter: {} };
          return null;
        },
      },
    };

    plugin = {
      vaultCache: {
        entryForPath: (path) => {
          if (path === 'a.md') return { tags: ['done'] };
          return null;
        },
      },
      algorithmicMeta: vi.fn((file) => {
        if (file.path === 'b.md') {
          return { title: 'B', tags: ['suggest-a', 'suggest-b'], tagDetails: [] };
        }
        return { title: file.path, tags: [], tagDetails: [] };
      }),
    };
  });

  it('counts untagged notes and collects suggestions', async () => {
    const result = await analyzeVault(app, plugin);
    expect(result.total).toBe(3);
    expect(result.untagged).toBe(2);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].path).toBe('b.md');
    expect(result.suggestions[0].tags).toEqual(['suggest-a', 'suggest-b']);
  });
});
