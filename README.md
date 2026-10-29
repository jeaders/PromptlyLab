<div align="center">

<img src="docs/brand/banner.png" alt="PromptlyLab — dall'idea al prompt perfetto" width="100%" />

<br />

### Il prompt giusto, al primo colpo.

Trasforma un obiettivo in un prompt strutturato e pronto all'uso, oppure migliora quello che usi già.
Curato per ChatGPT, Claude, Gemini, Midjourney e ogni altro modello.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team)

[![License: MIT](https://img.shields.io/badge/License-MIT-c8f451?style=flat-square)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-2f7d32?style=flat-square)](#contribuire)

<br />

[Panoramica](#panoramica) · [Screenshot](#screenshot) · [Avvio rapido](#avvio-rapido) · [API](#api) · [Struttura](#struttura-del-progetto)

</div>

---

## Panoramica

**PromptlyLab** è una web app che trasforma un'idea scritta in un prompt professionale, strutturato e verificato.
Non è un semplice "template store": analizza la richiesta, sceglie la struttura adatta al modello di destinazione,
punteggia il risultato e impara dai prompt che salvi.

| | |
| --- | --- |
| 🧠 **Prompt builder** | Due modalità: crea da zero o migliora un prompt esistente. Categoria, tono, livello di dettaglio e modello di destinazione. |
| 🎯 **Model-aware** | La struttura di output cambia se il target è ChatGPT, Claude, Gemini, Midjourney, Stable Diffusion o DALL·E. |
| 📊 **Quality score** | Analizzatore locale che misura chiarezza, contesto, vincoli, formato ed esempi — con suggerimenti su cosa manca. |
| 📚 **Libreria** | Oltre 2.000 prompt curati e della community, filtrabili per categoria, fonte e lingua. |
| ⭐ **Preferiti e cronologia** | Ogni generazione è salvata e ricercabile; puoi marcarla come preferita o riusarla. |
| 🌍 **Bilingue** | Interfaccia e contenuti in italiano e inglese, con un click. |
| 🔒 **Privacy first** | Nessuna chiave hardcoded: l'AI remota è opzionale e si attiva solo via variabile d'ambiente. |

### Come funziona

```text
obiettivo  ──▶  analisi  ──▶  struttura  ──▶  prompt  ──▶  quality score
                 │              │
                 │              └── ruoli, contesto, vincoli, formato, criteri
                 └── categoria, tono, lingua, modello di destinazione
```

Il motore di generazione è **deterministico e locale** per default: nessun prompt esce dalla macchina.
Se configuri `HF_TOKEN`, la generazione può avvalersi di un modello remoto — sempre in modo opzionale.

---

## Screenshot

<div align="center">

**Hero**

<img src="docs/screenshots/01-hero.png" alt="Home page di PromptlyLab" width="100%" />

**Prompt builder**

<img src="docs/screenshots/02-generator.png" alt="Prompt builder" width="100%" />

**Prompt generato, con quality score e riferimenti**

<img src="docs/screenshots/03-result.png" alt="Risultato della generazione" width="100%" />

**Libreria dei prompt**

<img src="docs/screenshots/04-library.png" alt="Libreria dei prompt" width="100%" />

**Mobile**

<img src="docs/screenshots/05-mobile.png" alt="Vista mobile" width="360" />

</div>

---

## Stack

| Layer | Tecnologia |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) — App Router, Turbopack |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Lucide](https://lucide.dev) |
| Linguaggio | [TypeScript 5.9](https://www.typescriptlang.org) |
| Database | [PostgreSQL](https://www.postgresql.org) + [Drizzle ORM](https://orm.drizzle.team) |
| Qualità | ESLint 9, `tsc --noEmit` |

---

## Avvio rapido

### Requisiti

- Node.js **20+**
- PostgreSQL **14+** in esecuzione

### 1. Clona e installa

```bash
git clone https://github.com/jeaders/PromptlyLab.git
cd PromptlyLab
npm install
```

### 2. Configura l'ambiente

Crea un file `.env.local` nella root (non viene versionato) — puoi partire dall'esempio:

```bash
cp .env.example .env.local
```

```bash
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_db"

# opzionale: abilita il provider AI remoto
# HF_TOKEN="hf_..."
```

Crea il database, se non esiste:

```bash
createdb app_db
```

### 3. Crea le tabelle

```bash
npx drizzle-kit push
```

Lo schema è definito in `src/db/schema.ts`; la libreria si popola automaticamente al primo accesso.

### 4. Avvia

```bash
npm run dev
```

Apri <http://localhost:3000>. Health check del database: <http://localhost:3000/api/health> → `{"ok":true}`.

---

## Variabili d'ambiente

| Variabile | Richiesta | Descrizione |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Stringa di connessione PostgreSQL. |
| `HF_TOKEN` | — | Token Hugging Face. Se assente (default) la generazione resta locale. |

> Nessun segreto è presente nel repository: `.env`, `.env.local` e `.env.*.local` sono esclusi da `.gitignore`.

---

## API

Tutte le route sono sotto `/api`, con risposte JSON e `dynamic = "force-dynamic"`.

| Endpoint | Metodo | Descrizione |
| --- | --- | --- |
| `/api/generate` | `POST` | Genera o migliora un prompt e salva la generazione. |
| `/api/generations` | `GET` | Cronologia delle generazioni (filtri: preferiti, ricerca, paginazione). |
| `/api/generations/[id]` | `GET` | Dettaglio di una generazione. |
| `/api/prompts` | `GET` · `POST` | Libreria paginata / aggiunge un prompt appreso. |
| `/api/prompts/[id]` | `GET` | Dettaglio di un prompt. |
| `/api/library/sync` | `POST` | Sincronizza la libreria curata. |
| `/api/stats` | `GET` | Contatori di libreria e generazioni. |
| `/api/health` | `GET` | Health check del database. |

<details>
<summary><b>Esempio: <code>POST /api/generate</code></b></summary>

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Piano di lancio per un SaaS di produttività",
    "category": "marketing",
    "tone": "professionale",
    "language": "it",
    "detailLevel": "balanced",
    "targetModel": "universal",
    "mode": "create"
  }'
```

```json
{
  "result": "# RUOLO\nAgisci come stratega di marketing...",
  "score": 100,
  "provider": "local",
  "references": []
}
```

</details>

---

## Struttura del progetto

```text
src/
├── app/
│   ├── api/                 # route handler (generate, prompts, generations, stats, health)
│   ├── globals.css          # design system + componenti
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── prompt-forge-app.tsx # shell dell'app (header, hero, sezioni, footer)
│   ├── generator.tsx        # prompt builder e pannello risultato
│   ├── library.tsx          # libreria, filtri, ricerca
│   ├── sheets.tsx           # modali e sheet
│   └── ui.tsx               # componenti condivisi
├── db/
│   ├── index.ts             # pool + client Drizzle
│   └── schema.ts            # tabelle prompts e generations
└── lib/
    ├── analyzer.ts          # quality score e suggerimenti
    ├── generator.ts         # motore di generazione (locale / HF opzionale)
    ├── catalog.ts           # categorie, modelli, toni
    ├── library.ts           # seed e statistiche della libreria
    ├── i18n.ts              # dizionario IT / EN
    └── types.ts
docs/
├── brand/                   # banner
└── screenshots/             # screenshot dell'app
```

---

## Script

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Dev server con Turbopack su `:3000`. |
| `npm run build` | Build di produzione. |
| `npm run start` | Server di produzione. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Controllo dei tipi con `tsc --noEmit`. |

---

## Contribuire

1. Fai un fork del repository
2. Crea un branch: `git checkout -b feature/nome-feature`
3. Commit: `git commit -m "feat: descrizione"`
4. Push: `git push origin feature/nome-feature`
5. Apri una pull request

---

## Licenza

Distribuito sotto licenza **MIT**. Vedi [LICENSE](LICENSE) per i dettagli.

<br />

<div align="center">

**Made by [Alex Mirici](https://alexmirici.netlify.app) — Web Developer**

© 2026 Alex Mirici — codice rilasciato con licenza MIT.

</div>
