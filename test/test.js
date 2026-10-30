'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const scanner = require('../src/scanner');
const minifier = require('../src/minifier');
const shorthand = require('../src/shorthand');
const rules = require('../src/rules');

function makeTmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctxdiet-'));
  fs.writeFileSync(path.join(dir, 'a.js'), '// comment\n\n\n\nconst x = 1;\n\n\n');
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.writeFileSync(path.join(dir, 'node_modules', 'ignore.js'), 'const y = 2;');
  return dir;
}

function testScan() {
  const dir = makeTmpRepo();
  const files = scanner.scan(dir);
  assert.strictEqual(files.length, 1, 'should ignore node_modules');
  assert.strictEqual(files[0].rel, 'a.js');
}

function testMinify() {
  const dir = makeTmpRepo();
  const files = scanner.scan(dir);
  const out = path.join(dir, '.out.txt');
  const r = minifier.writeMinified(files, out);
  assert.ok(r.afterBytes < r.beforeBytes, 'should shrink');
  assert.ok(fs.existsSync(out));
}

function testShorthand() {
  const input = 'function hello() {\n  return 1;\n}';
  const out = shorthand.toShorthand(input);
  assert.ok(out.includes('fn hello('));
  assert.ok(out.includes('-> '));
}

function testRules() {
  const dir = makeTmpRepo();
  const files = scanner.scan(dir);
  const r = rules.generate(files, dir, 'both');
  assert.strictEqual(r.written.length, 2);
  assert.ok(fs.existsSync(path.join(dir, '.cursorrules')));
  assert.ok(fs.existsSync(path.join(dir, '.clauderules')));
}

function testTokenEstimate() {
  assert.strictEqual(scanner.tokenEstimate(400), 100);
}

testScan();
testMinify();
testShorthand();
testRules();
testTokenEstimate();
console.log('✅ All tests passed');