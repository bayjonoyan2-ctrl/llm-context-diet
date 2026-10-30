'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules', '.git', '.github', 'dist', 'build', 'out',
  'coverage', '.next', '.nuxt', '.cache', '.venv', 'venv',
  '__pycache__', '.idea', '.vscode', 'vendor', 'target',
  '.contextdiet', '.context-diet'
]);

const TEXT_EXTS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.c', '.h', '.cpp', '.hpp', '.cs', '.php',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.toml', '.ini',
  '.md', '.txt', '.sh', '.bash', '.zsh',
  '.sql', '.graphql', '.vue', '.svelte'
]);

const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.pdf', '.zip', '.tar', '.gz', '.mp4', '.mp3', '.woff', '.woff2',
  '.ttf', '.otf', '.exe', '.dll', '.so', '.dylib', '.lock'
]);

const MAX_FILE_BYTES = 1024 * 1024;

function isIgnored(filePath, rootPath) {
  const rel = path.relative(rootPath, filePath);
  const parts = rel.split(path.sep);
  return parts.some((p) => DEFAULT_IGNORE_DIRS.has(p));
}

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTS.has(ext)) return false;
  return TEXT_EXTS.has(ext);
}

function walk(dir, rootPath, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!DEFAULT_IGNORE_DIRS.has(entry.name)) {
        walk(full, rootPath, out);
      }
    } else if (entry.isFile()) {
      if (isIgnored(full, rootPath)) continue;
      if (!isTextFile(full)) continue;
      let stat;
      try {
        stat = fs.statSync(full);
      } catch {
        continue;
      }
      if (stat.size > MAX_FILE_BYTES) continue;
      let content;
      try {
        content = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      out.push({
        path: full,
        rel: path.relative(rootPath, full).split(path.sep).join('/'),
        ext: path.extname(full).toLowerCase(),
        bytes: Buffer.byteLength(content, 'utf8'),
        lines: content.split('\n').length,
        content
      });
    }
  }
}

function scan(rootPath) {
  const files = [];
  walk(rootPath, rootPath, files);
  return files;
}

function tokenEstimate(bytes) {
  return Math.ceil(bytes / 4);
}

module.exports = {
  scan,
  tokenEstimate,
  DEFAULT_IGNORE_DIRS,
  TEXT_EXTS,
};