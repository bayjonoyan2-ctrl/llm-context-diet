# 🥗 llm-context-diet

> **Shrink your codebase context for AI coding assistants. Save tokens. Save money.**

[![CI](https://github.com/bayjonoyan2-ctrl/llm-context-diet/actions/workflows/ci.yml/badge.svg)](https://github.com/bayjonoyan2-ctrl/llm-context-diet/actions/workflows/ci.yml)
[![npm](https://img.shields.io/badge/npm-llm--context--diet-red)](https://www.npmjs.com/package/llm-context-diet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D16-blue)](package.json)

![demo](assets/demo.gif)

---

## The problem

Cursor, Copilot, Claude — they charge by **tokens**. Every time you paste a huge file, you pay for whitespace, boilerplate, and comments the AI doesn't need. Most repos burn **40–70% of their context budget on junk**.

## The fix

`llm-context-diet` scans your repo, strips the fat, and generates an **optimal `.cursorrules` / `.clauderules`** so the AI knows exactly what to load — and what to skip.

## Quick start (1 line)

```bash
npx llm-context-diet full