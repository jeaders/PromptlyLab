import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, inArray, or, sql } from "drizzle-orm";
import { seedPrompts } from "./prompt-data";
import { extendedSeedPrompts } from "./seed-catalog";
import type { Language } from "./catalog";

export const COMMUNITY_CSV_URL = "https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv";
export const COMMUNITY_REPO_URL = "https://github.com/f/awesome-chatgpt-prompts";

const globalState = globalThis as typeof globalThis & { __promptlySeed?: Promise<void>; __promptlySync?: Promise<SyncResult> };

/** Inserts curated prompts that are not yet in the database (idempotent, by title). */
async function seedCurated() {
  const all = [...seedPrompts, ...extendedSeedPrompts];
  const existing = await db.select({ title: prompts.title }).from(prompts).where(eq(prompts.source, "curated"));
  const have = new Set(existing.map((e) => e.title));
  const missing = all.filter((p) => !have.has(p.title));
  if (missing.length) await db.insert(prompts).values(missing.map((p) => ({ ...p, source: "curated", lang: "both" })));
}

export async function ensureLibrary() {
  globalState.__promptlySeed ??= seedCurated().catch((error) => {
    globalState.__promptlySeed = undefined;
    throw error;
  });
  await globalState.__promptlySeed;
  // Kick off the community import in the background the first time; never block the request.
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(prompts).where(eq(prompts.source, "community"));
  if (count === 0 && !globalState.__promptlySync) void syncCommunity().catch(() => undefined);
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  return rows;
}

const categoryRules: Array<[string, RegExp]> = [
  ["Carriera", /\b(interview|resume|career|recruit|job|cv|hiring)\b/],
  ["Immagini", /\b(midjourney|image|photo\w*|illustrat\w*|drawing|painting|logo|stable diffusion|dall-?e|portrait|ascii art)\b/],
  ["Video", /\b(video|youtube|tiktok|film|movie|screenwriter|cinemat\w*|reels?)\b/],
  ["Audio", /\b(music\w*|song\w*|rapper|composer|lyric\w*|podcast|audio|sound|dj)\b/],
  ["Giochi", /\b(game|gaming|rpg|dungeon|adventure|chess|quiz|riddle|text-based|tic-tac-toe)\b/],
  ["Dati", /\b(data|excel|spreadsheet|statistic\w*|analytics|chart|sql)\b/],
  ["Design", /\b(ux|ui|designer|design|interface|figma)\b/],
  ["Sviluppo", /\b(developer|programm\w*|code|coding|javascript|typescript|python|linux|terminal|regex|api|devops|software|engineer|react|java|php|solidity|git|windows|virtuali\w*|server|network\w*|telecom\w*|ftth|cyber\w*|security|deployment|payment gateway)\b|c\+\+|c#/],
  ["Marketing", /\b(marketing|seo|advertis\w*|social media|brand\w*|influencer|ads?)\b/],
  ["Business", /\b(business|startup|sales\w*|investor|financ\w*|accountant|ceo|entrepreneur|negotiat\w*|product manager|lawyer|legal|real estate|market|stock|equity|fund|e-?commerce)\b/],
  ["Ricerca", /\b(research\w*|scientist|historian|philosoph\w*|fact|academic|thesis|phd)\b/],
  ["Studio", /\b(teacher|tutor|learn\w*|student|math\w*|language|instructor|educat\w*|explain\w*)\b/],
  ["Produttività", /\b(productiv\w*|planner|assistant|email|organi[sz]\w*|schedule|time management)\b/],
  ["Lifestyle", /\b(travel|chef|food|recipe|fitness|trainer|health|doctor|life coach|fashion|relationship|motivat\w*|dietitian|yoga|hypno\w*|buddha|babysitter|florist|therap\w*|meditat\w*|astrolog\w*|spiritual\w*)\b/],
  ["Scrittura", /\b(writer|poet\w*|story|novel\w*|essay|journalist|editor|proofread\w*|translator|text|title|storyteller|character|cartoon|series|faq|rebuttal|timeline)\b/],
  ["Produttività", /\b(template|clarif\w*|answers|checklist|workflow)\b/],
];

const IMAGE_CUES = /\b(photorealistic|photograph\w*|aspect ratio|8k|4k|cinematic|composition|lighting|golden hour|depth of field|bokeh|render\w*|lens|camera angle|poster|wallpaper|textile|art style|illustration)\b|--ar\b/i;

export function categorize(act: string, prompt: string, type: string, forDevs: string) {
  if (type === "IMAGE") return "Immagini";
  const actLower = act.toLowerCase();
  for (const [cat, re] of categoryRules) if (re.test(actLower)) return cat;
  if (IMAGE_CUES.test(prompt.slice(0, 1500))) return "Immagini";
  if (forDevs === "TRUE") return "Sviluppo";
  const head = prompt.slice(0, 400).toLowerCase();
  for (const [cat, re] of categoryRules) if (re.test(head)) return cat;
  return "Altro";
}

export type SyncResult = { inserted: number; total: number; skipped: number };

export function syncCommunity(): Promise<SyncResult> {
  globalState.__promptlySync ??= (async () => {
    try {
      const response = await fetch(COMMUNITY_CSV_URL, { signal: AbortSignal.timeout(45000), cache: "no-store" });
      if (!response.ok) throw new Error(`CSV download failed: ${response.status}`);
      const rows = parseCsv(await response.text());
      const [header, ...data] = rows;
      const idx = (name: string) => header.indexOf(name);
      const iAct = idx("act"), iPrompt = idx("prompt"), iDevs = idx("for_devs"), iType = idx("type"), iContrib = idx("contributor");
      if (iAct < 0 || iPrompt < 0) throw new Error("Unexpected CSV format");

      const existing = await db.select({ title: prompts.title }).from(prompts).where(eq(prompts.source, "community"));
      const have = new Set(existing.map((e) => e.title.toLowerCase()));
      const values: (typeof prompts.$inferInsert)[] = [];
      let skipped = 0;
      for (const r of data) {
        const act = (r[iAct] ?? "").trim().slice(0, 160);
        const body = (r[iPrompt] ?? "").trim();
        const type = iType >= 0 ? (r[iType] ?? "TEXT") : "TEXT";
        if (!act || body.length < 60 || body.length > 4000 || type === "STRUCTURED" || have.has(act.toLowerCase())) { skipped++; continue; }
        have.add(act.toLowerCase());
        const category = categorize(act, body, type, iDevs >= 0 ? r[iDevs] ?? "" : "");
        const firstSentence = body.replace(/\s+/g, " ").split(/(?<=[.!?])\s/)[0].slice(0, 200);
        values.push({
          title: act, titleEn: act,
          description: firstSentence, descriptionEn: firstSentence,
          content: body, contentEn: body,
          category, tags: ["community", category.toLowerCase()],
          model: type === "IMAGE" ? "Image AI" : "Universale",
          source: "community", lang: "en",
          contributor: iContrib >= 0 ? (r[iContrib] || null)?.slice(0, 120) ?? null : null,
          sourceUrl: COMMUNITY_REPO_URL,
        });
      }
      for (let i = 0; i < values.length; i += 250) await db.insert(prompts).values(values.slice(i, i + 250));
      return { inserted: values.length, total: data.length, skipped };
    } finally {
      // Release the lock so a later manual re-sync runs a fresh import.
      globalState.__promptlySync = undefined;
    }
  })();
  return globalState.__promptlySync;
}

// ---------- Similarity retrieval ("learning" from the library) ----------

const STOP = new Set("della delle dello degli questo questa quello come anche sono essere fare puoi voglio vorrei ogni dove quando perché perche with that this from have your about into what which will would they them their there should could please want using una uno per con che non più alla allo nella nelle".split(" "));

export function tokens(text: string) {
  return new Set(
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOP.has(w)).map((w) => w.slice(0, 6)),
  );
}

export type Reference = { id: number; title: string; titleEn: string; source: string; content: string; lang: string; score: number };

export async function findSimilar(goal: string, category: string, limit = 3): Promise<Reference[]> {
  const goalTokens = tokens(goal);
  if (!goalTokens.size) return [];
  const keywords = [...goalTokens].slice(0, 4);
  const keywordFilter = keywords.map((k) => sql`lower(${prompts.title}) like ${"%" + k + "%"}`);
  const rows = await db
    .select({ id: prompts.id, title: prompts.title, titleEn: prompts.titleEn, source: prompts.source, content: prompts.content, contentEn: prompts.contentEn, lang: prompts.lang, category: prompts.category })
    .from(prompts)
    .where(or(eq(prompts.category, category), inArray(prompts.source, ["learned"]), ...keywordFilter))
    .limit(600);

  return rows
    .map((r) => {
      const t = tokens(`${r.title} ${r.titleEn} ${r.content.slice(0, 600)}`);
      let overlap = 0;
      for (const g of goalTokens) if (t.has(g)) overlap++;
      let score = overlap / Math.sqrt(goalTokens.size * Math.max(t.size, 1)) * 10;
      if (r.category === category) score += 0.4;
      if (r.source === "learned") score *= 1.3;
      if (r.source === "curated") score *= 1.1;
      return { id: r.id, title: r.title, titleEn: r.titleEn, source: r.source, content: r.content, lang: r.lang, score, overlap };
    })
    // Require at least 2 shared terms (or all of them for very short goals) to avoid spurious matches.
    .filter((r) => r.overlap >= Math.min(2, goalTokens.size))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ overlap: _overlap, ...rest }) => rest);
}

const DIRECTIVE = /(includ|evita|avoid|\bnon\b|never|do not|don't|ogni|each|every|format|struttur|structure|mantieni|keep|limit|massimo|max|usa |use |assicurati|ensure|separa|separate|cita|cite)/i;
const ROLE_LINE = /(agisci come|act as|i want you to act|you are an?|sei un)/i;
// Shared boilerplate from curated templates: already covered by the generator's base requirements.
const BOILERPLATE = /^(sii specifico e concreto|dichiara le assunzioni|se mancano informazioni|prima di rispondere|be specific and concrete|state assumptions|if essential information|before answering)/i;

/** Mines reusable directive sentences from reference prompts written in the target language. */
export function minePatterns(refs: Reference[], language: Language) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const ref of refs) {
    if (language === "it" && ref.lang === "en") continue;
    const sentences = ref.content.split(/(?<=[.!?])\s+|\n+/);
    let taken = 0;
    for (const raw of sentences) {
      const s = raw.replace(/^[-*\d.\s]+/, "").trim();
      if (s.length < 25 || s.length > 220 || ROLE_LINE.test(s) || BOILERPLATE.test(s) || !DIRECTIVE.test(s)) continue;
      const key = s.toLowerCase().slice(0, 40);
      if (seen.has(key)) continue;
      seen.add(key); out.push(s); taken++;
      if (taken >= 2 || out.length >= 5) break;
    }
    if (out.length >= 5) break;
  }
  return out;
}

export async function libraryStats() {
  const rows = await db.select({ source: prompts.source, count: sql<number>`count(*)::int` }).from(prompts).groupBy(prompts.source);
  const by = Object.fromEntries(rows.map((r) => [r.source, r.count])) as Record<string, number>;
  const [{ categories }] = await db.select({ categories: sql<number>`count(distinct ${prompts.category})::int` }).from(prompts);
  return { curated: by.curated ?? 0, community: by.community ?? 0, learned: by.learned ?? 0, total: rows.reduce((s, r) => s + r.count, 0), categories };
}

