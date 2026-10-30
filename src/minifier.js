'use strict';

const fs = require('fs');

const STRIP_EXT = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml'
]);

function collapseBlankLines(text) {
  return text.replace(/\n{3,}/g, '\n\n');
}

function stripTrailingWhitespace(text) {
  return text.replace(/[ \t]+$/gm, '');
}

function trimTopBottom(text) {
  return text.replace(/^\s+|\s+$/g, '');
}

function collapseIndent(text) {
  // Shrink leading indentation runs to a single space each level equivalent
  return text.replace(/^( +)/gm, (m) => {
    const levels = Math.floor(m.length / 2);
    return ' '.repeat(Math.max(0, Math.min(levels, 4)));
  });
}

function removeCommentsForExt(content, ext) {
  if (['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.css', '.scss', '.sass', '.less'].includes(ext)) {
    // remove block comments (not string-aware but good enough for context diet)
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // remove full-line // comments, keep inline ones
    content = content.replace(/^\s*\/\/.*$/gm, '');
    return content;
  }
  if (ext === '.py') {
    content = content.replace(/^\s*#.*$/gm, '');
    content = content.replace(/^\s*("""|''')[\s\S]*?\1\s*$/gm, '');
    return content;
  }
  return content;
}

function minifyFile(file) {
  let text = file.content;

  if (STRIP_EXT.has(file.ext)) {
    text = removeCommentsForExt(text, file.ext);
    text = stripTrailingWhitespace(text);
    text = collapseBlankLines(text);
    text = trimTopBottom(text);
    text = collapseIndent(text);
  } else if (file.ext === '.py') {
    text = removeCommentsForExt(text, file.ext);
    text = stripTrailingWhitespace(text);
    text = collapseBlankLines(text);
    text = trimTopBottom(text);
  } else {
    text = stripTrailingWhitespace(text);
    text = collapseBlankLines(text);
    text = trimTopBottom(text);
  }

  return text;
}

function writeMinified(files, outFile) {
  const beforeBytes = files.reduce((s, f) => s + f.bytes, 0);
  const chunks = [];
  for (const f of files) {
    const min = minifyFile(f);
    chunks.push(`### FILE: ${f.rel}\n${min}`);
  }
  const body = chunks.join('\n\n');
  fs.writeFileSync(outFile, body, 'utf8');
  const afterBytes = Buffer.byteLength(body, 'utf8');
  return {
    outFile,
    beforeBytes,
    afterBytes,
    savedBytes: beforeBytes - afterBytes,
    savedPct: beforeBytes === 0 ? 0 : ((beforeBytes - afterBytes) / beforeBytes) * 100,
    fileCount: files.length
  };
}

module.exports = {
  minifyFile,
  writeMinified,
};