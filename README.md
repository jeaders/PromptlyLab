# PromptlyLab

Generatore di prompt professionali: analizza l'obiettivo, propone prompt pronti all'uso, li salva in libreria e ne traccia le statistiche. Interfaccia bilingue (IT/EN).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL** + **Drizzle ORM**

## Avvio locale

```bash
npm install
npm run dev
```

App su http://localhost:3000

### Database

Il progetto si aspetta un PostgreSQL locale (vedi `drizzle.config.json`, default `postgresql://postgres:postgres@127.0.0.1:5432/app_db`).

Health check: `GET /api/health` → `{ "ok": true }`.

### Variabili d'ambiente

| Variabile | Descrizione |
| --- | --- |
| `HF_TOKEN` | Token Hugging Face opzionale: se presente, la generazione usa un modello remoto; altrimenti resta in locale. |
| `DATABASE_URL` | Connessione PostgreSQL (se gestita via env). |

## API

| Endpoint | Metodo |
| --- | --- |
| `/api/generate` | POST |
| `/api/generations` | GET, POST |
| `/api/generations/[id]` | GET |
| `/api/prompts` | GET, POST |
| `/api/prompts/[id]` | GET |
| `/api/library/sync` | POST |
| `/api/stats` | GET |
| `/api/health` | GET |

## Script

```bash
npm run dev        # dev server
npm run build      # build di produzione
npm run start      # server di produzione
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```
