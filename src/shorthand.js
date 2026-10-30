'use strict';

// Compress long boilerplate into pseudo-shorthand summaries.
// Not semantic — purely token-saving hints for AI context.

const RULES = [
  { test: /^import\s+.*$/gm, replace: '' },
  { test: /^export\s+default\s+/gm, replace: '' },
  { test: /^export\s+/gm, replace: '' },
  { test: /^from\s+.*$/gm, replace: '' },
  { test: /\bconst\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, replace: 'req $1=$2' },
  { test: /\bfunction\s+(\w+)\s*\(/g, replace: 'fn $1(' },
  { test: /\bclass\s+(\w+)/g, replace: 'cls $1' },
  { test: /\basync\s+function/g, replace: 'afn' },
  { test: /\bawait\s+/g, replace: '' },
  { test: /\breturn\s+/g, replace: '-> ' },
  { test: /\bif\s*\(/g, replace: '?' },
  { test: /\belse\s*\{/g, replace: ':' },
  { test: /\bconsole\.log\(/g, replace: 'log(' },
  { test: /\bmodule\.exports\s*=/g, replace: 'exp=' },
  { test: /\bexports\.(\w+)\s*=/g, replace: 'exp.$1=' },
];

function toShorthand(text) {
  let out = text;
  for (const r of RULES) {
    out = out.replace(r.test, r.replace);
  }
  return out;
}

module.exports = { toShorthand };