#!/usr/bin/env node
'use strict';

const path = require('path');
const scanner = require('../src/scanner');
const minifier = require('../src/minifier');
const shorthand = require('../src/shorthand');
const rules = require('../src/rules');
const reporter = require('../src/reporter');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
llm-context-diet — shrink codebase context for AI assistants

Usage:
  npx llm-context-diet scan   [--path <dir>] [--top <n>]
  npx llm-context-diet minify [--path <dir>] [--out <file>]
  npx llm-context-diet rules  [--path <dir>] [--tool cursor|claude|both]
  npx llm-context-diet full   [--path <dir>] [--tool cursor|claude|both]

Options:
  --path    Target directory (default: current dir)
  --out     Output file for minified context (default: .context.min.txt)
  --tool    Which rules file to generate (default: both)
  --top     Show top N heaviest files (default: 10)

Examples:
  npx llm-context-diet scan
  npx llm-context-diet rules --tool cursor
  npx llm-context-diet full --path ./src
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];
  const rootPath = path.resolve(args.path || process.cwd());
  const topN = parseInt(args.top || '10', 10);

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    return;
  }

  switch (cmd) {
    case 'scan': {
      const files = scanner.scan(rootPath);
      reporter.printScanReport(files, topN);
      break;
    }
    case 'minify': {
      const files = scanner.scan(rootPath);
      const outFile = path.resolve(args.out || path.join(rootPath, '.context.min.txt'));
      const result = minifier.writeMinified(files, outFile);
      reporter.printMinifyReport(result);
      break;
    }
    case 'rules': {
      const files = scanner.scan(rootPath);
      const tool = args.tool || 'both';
      const r = rules.generate(files, rootPath, tool);
      reporter.printRulesReport(r);
      break;
    }
    case 'full': {
      const files = scanner.scan(rootPath);
      reporter.printScanReport(files, topN);
      const outFile = path.resolve(args.out || path.join(rootPath, '.context.min.txt'));
      const min = minifier.writeMinified(files, outFile);
      reporter.printMinifyReport(min);
      const tool = args.tool || 'both';
      const r = rules.generate(files, rootPath, tool);
      reporter.printRulesReport(r);
      console.log('\n✅ Done. Drop .cursorrules / .clauderules in your project root.\n');
      break;
    }
    default:
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
  }
}

main();