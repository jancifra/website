# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

Next.js 15 App Router project with TypeScript and Tailwind CSS v4.

- `src/app/layout.tsx` — Root layout with Geist fonts and metadata
- `src/app/page.tsx` — Single-page portfolio (Hero, About, Experience, Contact sections)
- `src/app/globals.css` — Tailwind import and CSS custom properties for light/dark theme

All routing uses the App Router (`src/app/`). Pages are React Server Components by default — add `"use client"` only when browser APIs or interactivity are needed.

Tailwind v4 is configured via `@import "tailwindcss"` in `globals.css` (no `tailwind.config.js`).
