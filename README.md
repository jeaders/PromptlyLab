<div align="center">

<img src="docs/brand/banner.png" alt="PromptlyLab — from idea to the perfect prompt" width="100%" />

<br />

### The right prompt, on the first try.

Turn a goal into a structured, ready-to-use prompt — or improve the one you already use. Tailored for ChatGPT, Claude, Gemini, Midjourney and every other model.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.4-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)

[![License: MIT](https://img.shields.io/badge/License-MIT-c8f451?style=for-the-badge)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-2f7d32?style=for-the-badge)](#contributing)

<br />

[Overview](#overview) · [100% free & unlimited — no API keys](#100-free--unlimited--no-api-keys) · [Screenshot](#screenshot) · [Quick start](#quick-start) · [API](#api) · [Project structure](#project-structure) · [License](#license)

</div>

---

## Overview

**PromptlyLab** is a web app that turns a written idea into a professional, structured and verified prompt. It's not just a "template store": it analyzes the request, picks the right structure for the target model, scores the result and learns from the prompts you save.

| | |
| --- | --- |
| 🧠 **Prompt builder** | Two modes: create from scratch or improve an existing prompt. Category, tone, detail level and target model. |
| 🎯 **Model-aware** | Output structure changes depending on whether the target is ChatGPT, Claude, Gemini, Midjourney, Stable Diffusion or DALL·E. |
| 📊 **Quality score** | Local analyzer that measures clarity, context, constraints, format and examples — with suggestions on what's missing. |
| 📚 **Library** | Over 2,000 curated and community prompts, filterable by category, source and language. |
| ⭐ **Favorites & history** | Every generation is saved and searchable; mark it as favorite or reuse it. |
| 🌍 **Bilingual** | Interface and content in Italian and English, one click away. |
| 🔒 **Privacy first** | No hardcoded keys: remote AI is optional and only activates via environment variable. |

### How it works

```text
goal  ──▶  analysis  ──▶  structure  ──▶  prompt  ──▶  quality score
             │              │
             │              └── roles, context, constraints, format, criteria
             └── category, tone, language, target model
```

The generation engine is **deterministic and local** by default: no prompt ever leaves your machine. If you configure `HF_TOKEN`, generation can optionally use a remote model.

---

## 100% free & unlimited — no API keys

**PromptlyLab requires no API key, no account and has no usage limits.** Generation runs entirely on your server: it's code, not a metered service.

```text
goal ──▶ buildPrompt() ──▶ prompt + quality score
            rules, catalogs, patterns     (local, unlimited)
                   ▲
                   └── HF_TOKEN (optional, with automatic fallback)
```

| What | Requires | Cost | Limits |
| --- | --- | --- | --- |
| **Prompt generation** | nothing | **0 €** | **none** |
| Quality score and analysis | nothing | **0 €** | none |
| Library (2,000+ prompts) | nothing | **0 €** | none |
| History, favorites | PostgreSQL | 0 € on free tier | — |
| Community seed | nothing | 0 € | one public download, once |
| LLM-based improvement | `HF_TOKEN` | metered | optional, with fallback |

**Why it's unlimited:** no calls to an AI provider, no tokens to count, no quotas. The only external dependency is the database (free on Neon/Supabase free tier).

**What if the remote provider fails?** Code falls back automatically to the local engine (`provider: "local"`): the prompt is still generated, the app never crashes.

> No credit card, no `sk-...` in the repo, no telemetry. Clone, run, use as much as you want.

---

## Screenshot

<div align="center">

**Hero**

<img src="docs/screenshots/01-hero.png" alt="PromptlyLab home page" width="100%" />

**Prompt builder**

<img src="docs/screenshots/02-generator.png" alt="Prompt builder" width="100%" />

**Generated prompt, with quality score and references**

<img src="docs/screenshots/03-result.png" alt="Generation result" width="100%" />

**Prompt library**

<img src="docs/screenshots/04-library.png" alt="Prompt library" width="100%" />

**Mobile**

<img src="docs/screenshots/05-mobile.png" alt="Mobile view" width="360" />

</div>

---

## Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Lucide](https://lucide.dev) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org) |
| Database | [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team) |
| Quality | ESLint 9, `tsc --noEmit` |

---

## Quick start

### Requirements

- Node.js **20+**
- PostgreSQL **14+** running

### 1. Clone and install

```bash
git clone https://github.com/jeaders/PromptlyLab.git
cd PromptlyLab
npm install
```

### 2. Configure the environment

Create a `.env.local` file in the root (not versioned) — you can start from the example:

```bash
cp .env.example .env.local
```

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_db"

# optional: enable remote AI provider
# HF_TOKEN="hf_..."
```

Create the database if it doesn't exist:

```bash
createdb app_db
```

### 3. Create the tables

```bash
npx drizzle-kit push
```

The schema is defined in `src/db/schema.ts`; the library self-populates on first access.

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>. Database health check: <http://localhost:3000/api/health> → `{"ok":true}`.

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string. |
| `HF_TOKEN` | — | Hugging Face token. If absent (default) generation stays local. |

> No secrets are in the repository: `.env`, `.env.local` and `.env.*.local` are excluded via `.gitignore`.

---

## API

All routes are under `/api`, with JSON responses and `dynamic = "force-dynamic"`.

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/generate` | `POST` | Generate or improve a prompt and save the generation. |
| `/api/generations` | `GET` | Generation history (filters: favorites, search, pagination). |
| `/api/generations/[id]` | `GET` | Detail of a generation. |
| `/api/prompts` | `GET` · `POST` | Paginated library / add a learned prompt. |
| `/api/prompts/[id]` | `GET` | Detail of a prompt. |
| `/api/library/sync` | `POST` | Synchronize the curated library. |
| `/api/stats` | `GET` | Library and generation counters. |
| `/api/health` | `GET` | Database health check. |

<details>
<summary><b>Example: <code>POST /api/generate</code></b></summary>

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Launch plan for a productivity SaaS",
    "category": "marketing",
    "tone": "professional",
    "language": "it",
    "detailLevel": "balanced",
    "targetModel": "universal",
    "mode": "create"
  }'
```

```json
{
  "result": "# ROLE\nAct as marketing strategist...",
  "score": 100,
  "provider": "local",
  "references": []
}
```

</details>

---

## Project structure

```text
src/
├── app/
│   ├── api/                 # route handlers (generate, prompts, generations, stats, health)
│   ├── globals.css          # design system + components
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── generator.tsx        # prompt builder and result panel
│   ├── library.tsx          # library, filters, search
│   ├── prompt-forge-app.tsx # app shell (header, hero, sections, footer)
│   ├── sheets.tsx           # modals and sheets
│   └── ui.tsx               # shared components
├── db/
│   ├── index.ts             # pool + Drizzle client
│   └── schema.ts            # prompts and generations tables
└── lib/
    ├── analyzer.ts          # quality score and suggestions
    ├── generator.ts         # generation engine (local / HF optional)
    ├── catalog.ts           # categories, models, tones
    ├── library.ts           # seed and library statistics
    ├── i18n.ts              # IT / EN dictionary
    └── types.ts
docs/
├── brand/                   # banner
└── screenshots/             # app screenshots
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with Turbopack on `:3000`. |
| `npm run build` | Production build. |
| `npm run start` | Production server. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Type check with `tsc --noEmit`. |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/name`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/name`
5. Open a pull request

---

## License

Distributed under the **MIT** license. See [LICENSE](LICENSE) for details.

<br />

<div align="center">

**Made by [Alex Mirici](https://alexmirici.netlify.app) — Web Developer**

© 2026 Alex Mirici — code released under the MIT license.

</div>
