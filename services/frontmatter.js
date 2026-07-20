function normalizeTags(tags) {
  return (Array.isArray(tags) ? tags : [tags])
    .map((tag) => String(tag).replace(/^#/, '').trim())
    .filter(Boolean);
}

function mergeTagArrays(existing, incoming) {
  const seen = new Set();
  const out = [];
  for (const tag of [...normalizeTags(existing), ...normalizeTags(incoming)]) {
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out;
}

async function applyTagsToFrontmatter(app, file, tags, mode) {
  const list = normalizeTags(tags);
  if (!list.length || !file) return false;

  if (mode === 'frontmatter') {
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
      const current = frontmatter.tags;
      frontmatter.tags = mergeTagArrays(current, list);
    });
    return true;
  }

  const leaf = app.workspace.activeLeaf;
  const view = leaf && leaf.view && leaf.view.editor ? leaf.view : null;
  if (!view || view.file !== file) return false;
  const line = list.map((tag) => '#' + tag).join(' ') + '\n';
  const editor = view.editor;
  const last = editor.lastLine();
  editor.replaceRange(line, { line: last + 1, ch: 0 });
  return true;
}

module.exports = {
  normalizeTags,
  mergeTagArrays,
  applyTagsToFrontmatter,
};
