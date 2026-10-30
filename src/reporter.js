'use strict';

const scanner = require('./scanner');

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

function printScanReport(files, topN) {
  const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
  const totalTokens = scanner.tokenEstimate(totalBytes);
  console.log('\n📊 Context Diet — Scan');
  console.log('─'.repeat(50));
  console.log(`Files:         ${files.length}`);
  console.log(`Total size:    ${kb(totalBytes)}`);
  console.log(`Est. tokens:   ~${totalTokens}`);
  console.log(`\nTop ${topN} heaviest files:`);
  const sorted = [...files].sort((a, b) => b.bytes - a.bytes).slice(0, topN);
  for (const f of sorted) {
    console.log(`  ${kb(f.bytes).padStart(9)}  ~${String(scanner.tokenEstimate(f.bytes)).padStart(6)} tok  ${f.rel}`);
  }
  console.log('');
}

function printMinifyReport(result) {
  console.log('\n🧼 Context Diet — Minify');
  console.log('─'.repeat(50));
  console.log(`Files written: ${result.fileCount}`);
  console.log(`Before:        ${kb(result.beforeBytes)} (~${scanner.tokenEstimate(result.beforeBytes)} tok)`);
  console.log(`After:         ${kb(result.afterBytes)} (~${scanner.tokenEstimate(result.afterBytes)} tok)`);
  console.log(`Saved:         ${kb(result.savedBytes)} (${result.savedPct.toFixed(1)}%)`);
  console.log(`Output:        ${result.outFile}`);
  console.log('');
}

function printRulesReport(result) {
  console.log('\n📜 Context Diet — Rules');
  console.log('─'.repeat(50));
  console.log(`Generated for ${result.fileCount} files:`);
  for (const p of result.written) console.log(`  → ${p}`);
  console.log('');
}

module.exports = { printScanReport, printMinifyReport, printRulesReport };