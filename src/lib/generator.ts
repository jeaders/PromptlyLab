import { analyzePrompt, type CheckId } from "./analyzer";
import { isImageModel, type AspectRatio, type Category, type Language, type TargetModel, type Technique } from "./catalog";

export type GenerateInput = {
  goal: string;
  category: Category;
  tone: string;
  language: Language;
  detailLevel: "concise" | "balanced" | "deep";
  context?: string;
  audience?: string;
  outputFormat?: string;
  targetModel: TargetModel;
  techniques: Technique[];
  aspectRatio: AspectRatio;
  mode: "create" | "improve";
};

type Blueprint = { role: [string, string]; focus: [string[], string[]]; output: [string, string] };

const B: Record<Category, Blueprint> = {
  Marketing: { role: ["stratega di marketing e growth lead senior", "senior marketing strategist and growth lead"], focus: [["Collega ogni azione a un KPI misurabile.", "Parla ai bisogni reali del pubblico, non alle caratteristiche."], ["Tie every action to a measurable KPI.", "Speak to real audience needs, not features."]], output: ["Insight chiave, piano operativo in tabella, KPI ed esperimenti A/B.", "Key insights, an operational plan as a table, KPIs and A/B experiments."] },
  Scrittura: { role: ["editor e scrittore senior", "senior editor and writer"], focus: [["Privilegia frasi chiare, ritmo variato ed esempi concreti.", "Elimina cliché, ripetizioni e riempitivi."], ["Favor clear sentences, varied rhythm and concrete examples.", "Remove clichés, repetition and filler."]], output: ["Testo finale pronto alla pubblicazione con titolo e sottotitoli.", "Publication-ready text with headline and subheadings."] },
  Immagini: { role: ["art director e prompt designer", "art director and prompt designer"], focus: [["Descrivi soggetto, composizione, luce, palette e stile.", "Escludi testo, watermark e artefatti."], ["Describe subject, composition, light, palette and style.", "Exclude text, watermarks and artifacts."]], output: ["Prompt immagine dettagliato più negative prompt.", "A detailed image prompt plus a negative prompt."] },
  Video: { role: ["regista e sceneggiatore video", "video director and scriptwriter"], focus: [["Cattura l'attenzione nei primi 3 secondi.", "Indica inquadrature, audio e testo a schermo."], ["Hook attention in the first 3 seconds.", "Specify shots, audio and on-screen text."]], output: ["Script a beat con timestamp, visual, audio e CTA.", "Beat-by-beat script with timestamps, visuals, audio and CTA."] },
  Audio: { role: ["produttore musicale e sound designer", "music producer and sound designer"], focus: [["Specifica genere, BPM, strumenti e struttura.", "Descrivi emozione ed energia di ogni sezione."], ["Specify genre, BPM, instruments and structure.", "Describe the emotion and energy of each section."]], output: ["Struttura per sezioni con indicazioni di produzione.", "Section-by-section structure with production notes."] },
  Sviluppo: { role: ["principal software engineer", "principal software engineer"], focus: [["Scrivi codice completo, tipizzato, sicuro e testabile.", "Non inventare API: segnala ogni incertezza."], ["Write complete, typed, secure, testable code.", "Never invent APIs: flag any uncertainty."]], output: ["Assunzioni, soluzione, codice completo, test e passi di verifica.", "Assumptions, solution, complete code, tests and verification steps."] },
  Dati: { role: ["data scientist senior", "senior data scientist"], focus: [["Verifica qualità e limiti dei dati prima delle conclusioni.", "Distingui correlazione e causalità."], ["Check data quality and limits before concluding.", "Separate correlation from causation."]], output: ["Metodo, risultati, visualizzazioni consigliate e codice riproducibile.", "Method, findings, suggested charts and reproducible code."] },
  Design: { role: ["product designer senior UI/UX", "senior UI/UX product designer"], focus: [["Progetta mobile-first e rispetta WCAG 2.2 AA.", "Giustifica ogni scelta con un principio di usabilità."], ["Design mobile-first and meet WCAG 2.2 AA.", "Justify every choice with a usability principle."]], output: ["Flusso, specifiche delle schermate, stati e motivazioni.", "Flow, screen specs, states and rationale."] },
  Business: { role: ["consulente strategico e product leader", "strategy consultant and product leader"], focus: [["Quantifica impatto, costi e rischi.", "Rendi esplicite le ipotesi da validare."], ["Quantify impact, cost and risk.", "Make assumptions to validate explicit."]], output: ["Sintesi esecutiva, analisi, opzioni a confronto e raccomandazione.", "Executive summary, analysis, compared options and recommendation."] },
  Ricerca: { role: ["analista di ricerca e fact-checker", "research analyst and fact-checker"], focus: [["Separa fatti, interpretazioni e ipotesi.", "Indica il livello di confidenza di ogni conclusione."], ["Separate facts, interpretations and hypotheses.", "State confidence for every conclusion."]], output: ["Sintesi, evidenze, tabella comparativa, limiti e raccomandazioni.", "Summary, evidence, comparison table, limitations and recommendations."] },
  Studio: { role: ["tutor esperto di scienze dell'apprendimento", "tutor expert in learning science"], focus: [["Procedi dal semplice al complesso con analogie.", "Verifica la comprensione con domande attive."], ["Go from simple to complex with analogies.", "Check understanding with active questions."]], output: ["Spiegazione progressiva, esempi, esercizi e soluzioni.", "Progressive explanation, examples, exercises and solutions."] },
  Produttività: { role: ["coach di produttività e project manager", "productivity coach and project manager"], focus: [["Trasforma tutto in azioni concrete con scadenza.", "Dai priorità per impatto e sforzo."], ["Turn everything into concrete, dated actions.", "Prioritize by impact and effort."]], output: ["Checklist di azioni, priorità e piano temporale.", "Action checklist, priorities and timeline."] },
  Carriera: { role: ["career coach e recruiter senior", "career coach and senior recruiter"], focus: [["Usa risultati misurabili e il metodo STAR.", "Adatta tutto al ruolo e al settore target."], ["Use measurable results and the STAR method.", "Tailor everything to the target role and industry."]], output: ["Materiale pronto all'uso più punti da personalizzare.", "Ready-to-use material plus points to personalize."] },
  Lifestyle: { role: ["consulente lifestyle esperto", "expert lifestyle consultant"], focus: [["Rendi i consigli pratici, sostenibili e adattabili.", "Per salute, finanza o temi legali ricorda di consultare un professionista."], ["Keep advice practical, sustainable and adaptable.", "For health, finance or legal topics, recommend consulting a professional."]], output: ["Piano pratico con passi, alternative e consigli.", "Practical plan with steps, alternatives and tips."] },
  Giochi: { role: ["game designer e narratore", "game designer and storyteller"], focus: [["Offri scelte significative e conseguenze coerenti.", "Mantieni regole e tono coerenti."], ["Offer meaningful choices and consistent consequences.", "Keep rules and tone consistent."]], output: ["Contenuto di gioco strutturato pronto da usare.", "Structured, ready-to-play game content."] },
  Altro: { role: ["esperto senior multidisciplinare", "senior multidisciplinary expert"], focus: [["Sii concreto e orientato al risultato.", "Dichiara assunzioni e limiti."], ["Be concrete and outcome-focused.", "State assumptions and limitations."]], output: ["Titoli chiari, punti elenco e prossime azioni.", "Clear headings, bullet points and next actions."] },
};

const L = {
  it: { role: "RUOLO", objective: "OBIETTIVO", context: "CONTESTO", audience: "Pubblico", method: "METODO", requirements: "REQUISITI", output: "FORMATO DI OUTPUT", examples: "ESEMPI", creative: "ESPANSIONE CREATIVA", patterns: "PATTERN APPRESI DALLA LIBRERIA", check: "CONTROLLO QUALITÀ", actAs: "Agisci come", tone: "Tono", noContext: "Individua il contesto mancante e formula solo assunzioni ragionevoli ed esplicite.",
    detail: { concise: "Sii essenziale: massimo 5 punti, nessun preambolo.", balanced: "Bilancia sintesi e profondità; motiva le decisioni importanti.", deep: "Approfondisci: considera casi limite, alternative e implicazioni." },
    steps: ["Riformula il risultato atteso in una frase precisa.", "Dividi il lavoro in passaggi logici ordinati per impatto.", "Produci un risultato concreto e immediatamente utilizzabile."],
    base: ["Preferisci dettagli, esempi e criteri misurabili ai consigli generici.", "Non inventare dati, fonti o capacità; dichiara le incertezze."],
    finalCheck: "Prima di rispondere verifica accuratezza, completezza, pertinenza e applicabilità. Restituisci solo la risposta finale.",
    tech: { clarify: "Prima di iniziare fammi al massimo 3 domande mirate e attendi le risposte.", stepByStep: "Ragiona passo dopo passo; mostra una breve sintesi del ragionamento prima della risposta finale.", examples: "Esempio 1 dell'output desiderato: [INCOLLA UN ESEMPIO]\nEsempio 2: [INCOLLA UN ESEMPIO]\nSegui stile, struttura e livello di dettaglio degli esempi.", selfCritique: "Dopo la bozza, criticala rispetto all'obiettivo e ai requisiti, poi consegna solo la versione migliorata.", variants: "Fornisci 3 varianti distinte (A, B, C) e indica quando usare ciascuna.", sources: "Cita fonti verificabili (titolo, autore, data, URL) e segnala ciò che non è verificato." },
  },
  en: { role: "ROLE", objective: "OBJECTIVE", context: "CONTEXT", audience: "Audience", method: "METHOD", requirements: "REQUIREMENTS", output: "OUTPUT FORMAT", examples: "EXAMPLES", creative: "CREATIVE EXPANSION", patterns: "PATTERNS LEARNED FROM THE LIBRARY", check: "QUALITY CHECK", actAs: "Act as", tone: "Tone", noContext: "Identify missing context and make only reasonable, explicit assumptions.",
    detail: { concise: "Be concise: up to 5 points, no preamble.", balanced: "Balance brevity and depth; explain important decisions.", deep: "Go deep: consider edge cases, alternatives and implications." },
    steps: ["Restate the intended outcome in one precise sentence.", "Break the work into logical steps ordered by impact.", "Produce a concrete, immediately usable result."],
    base: ["Prefer specifics, examples and measurable criteria over generic advice.", "Never fabricate data, sources or capabilities; flag uncertainty."],
    finalCheck: "Before answering, verify accuracy, completeness, relevance and actionability. Return only the final answer.",
    tech: { clarify: "Before starting, ask me up to 3 targeted questions and wait for my answers.", stepByStep: "Reason step by step; show a brief summary of your reasoning before the final answer.", examples: "Example 1 of the desired output: [PASTE AN EXAMPLE]\nExample 2: [PASTE AN EXAMPLE]\nMatch the style, structure and level of detail of the examples.", selfCritique: "After drafting, critique it against the objective and requirements, then deliver only the improved version.", variants: "Provide 3 distinct variants (A, B, C) and explain when to use each.", sources: "Cite verifiable sources (title, author, date, URL) and flag anything unverified." },
  },
};

const IMAGE_STYLE: Record<string, string> = {
  Professionale: "clean editorial look, refined, balanced composition",
  Amichevole: "warm, inviting, soft natural light",
  Persuasivo: "bold hero composition, high contrast, premium advertising look",
  Creativo: "imaginative, surreal accents, unexpected color palette",
  Tecnico: "precise, accurate proportions, neutral studio lighting",
  Accademico: "documentary realism, natural colors",
  Ironico: "playful, quirky details, vibrant colors",
  Empatico: "intimate, gentle, golden hour light",
};
const NEGATIVE = "text, watermark, logo, signature, blurry, low resolution, extra fingers, deformed anatomy, duplicate elements, oversaturated, plastic skin";

const CREATIVE: Record<Category, [string, string]> = {
  Marketing: ["Genera 3 angoli creativi e inediti per il mercato target, poi sviluppa il più promettente con dettagli operativi.", "Generate 3 novel and unprecedented creative angles for the target market, then develop the most promising one with operational detail."],
  Scrittura: ["Proponi 3 direzioni narrative o stilistiche originali e inaspettate, poi sviluppa la migliore.", "Propose 3 original and unexpected narrative or stylistic directions, then develop the best one."],
  Immagini: ["Immagina 3 composizioni visive inedite e originali, poi dettaglia la più forte.", "Imagine 3 novel and original visual compositions, then detail the strongest one."],
  Video: ["Proponi 3 hook o strutture narrative non convenzionali, poi sviluppa la più efficace.", "Propose 3 unconventional hook or narrative structures, then develop the most effective one."],
  Audio: ["Inventa 3 direzioni sonore o musicali originali, poi sviluppa la più interessante.", "Invent 3 original sound or musical directions, then develop the most interesting one."],
  Sviluppo: ["Proponi 3 approcci architetturali o di design non ovvi, poi sviluppa il più robusto.", "Propose 3 non-obvious architectural or design approaches, then develop the most robust one."],
  Dati: ["Formula 3 ipotesi non ovvie e 3 visualizzazioni inedite, poi sviluppa la più rivelatrice.", "Formulate 3 non-obvious hypotheses and 3 novel visualizations, then develop the most revealing one."],
  Design: ["Immagina 3 soluzioni di interazione originali e non convenzionali, poi sviluppa la migliore.", "Imagine 3 original and unconventional interaction solutions, then develop the best one."],
  Business: ["Genera 3 modelli di business o strategie non convenzionali, poi sviluppa il più promettente.", "Generate 3 unconventional business models or strategies, then develop the most promising one."],
  Ricerca: ["Formula 3 domande di ricerca inedite e 3 prospettive non ovvie, poi sviluppa la più rilevante.", "Formulate 3 novel research questions and 3 non-obvious perspectives, then develop the most relevant one."],
  Studio: ["Crea 3 analogie o metafore originali per spiegare il concetto, poi sviluppa la più efficace.", "Create 3 original analogies or metaphors to explain the concept, then develop the most effective one."],
  Produttività: ["Proponi 3 sistemi o workflow inediti, poi sviluppa il più sostenibile.", "Propose 3 novel systems or workflows, then develop the most sustainable one."],
  Carriera: ["Immagina 3 narrazioni professionali originali, poi sviluppa la più convincente.", "Imagine 3 original professional narratives, then develop the most compelling one."],
  Lifestyle: ["Proponi 3 approcci inediti e personalizzati, poi sviluppa il più realistico.", "Propose 3 novel and personalized approaches, then develop the most realistic one."],
  Giochi: ["Inventa almeno 5 concept di gioco MAI ESISTITI, con meccaniche originali e inedite, poi sviluppa il più originale in dettaglio completo.", "Invent at least 5 game concepts that have NEVER EXISTED, with original and unprecedented mechanics, then fully develop the most original one."],
  Altro: ["Genera 3 approcci originali e inediti al problema, poi sviluppa il più efficace.", "Generate 3 original and unprecedented approaches to the problem, then develop the most effective one."],
};


function section(title: string, body: string, xml: boolean) {
  if (xml) {
    const tag = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
    return `<${tag}>\n${body}\n</${tag}>`;
  }
  return `# ${title}\n${body}`;
}

function buildImagePrompt(input: GenerateInput) {
  const style = IMAGE_STYLE[input.tone] ?? IMAGE_STYLE.Professionale;
  const extra = { concise: "", balanced: ", cinematic lighting, rich textures", deep: ", cinematic lighting, rich textures, layered depth, intricate detail, carefully art-directed color grading" }[input.detailLevel];
  const subject = input.goal.trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "");
  const ctx = input.context?.trim() ? `, ${input.context.trim().replace(/\s+/g, " ")}` : "";
  const notes: string[] = [];
  if (input.language === "it" && input.targetModel !== "dalle") notes.push("image-english");

  if (input.targetModel === "midjourney") {
    return { result: `${subject}${ctx}, ${style}${extra}, highly detailed, professional photography --ar ${input.aspectRatio} --style raw --v 7 --no ${NEGATIVE.split(", ").slice(0, 6).join(", ")}`, notes };
  }
  if (input.targetModel === "stable-diffusion") {
    return { result: `Positive prompt:\n${subject}${ctx}, ${style}${extra}, masterpiece, best quality, highly detailed, sharp focus\n\nNegative prompt:\n${NEGATIVE}\n\nSettings:\nAspect ratio ${input.aspectRatio} · Steps 28–35 · CFG 5–7 (Flux: ignore the negative prompt and use guidance ~3.5)`, notes };
  }
  // DALL·E / GPT Image prefer natural-language descriptions.
  const it = input.language === "it";
  return {
    result: it
      ? `Crea un'immagine di ${subject}${ctx}. Stile: ${style}${extra}. Formato ${input.aspectRatio}. Composizione chiara con un unico punto focale, dettagli realistici e illuminazione coerente. Non includere testo, watermark o loghi.`
      : `Create an image of ${subject}${ctx}. Style: ${style}${extra}. Aspect ratio ${input.aspectRatio}. Clear composition with a single focal point, realistic details and consistent lighting. Do not include text, watermarks or logos.`,
    notes,
  };
}

export function buildPrompt(input: GenerateInput, patterns: string[] = []) {
  if (isImageModel(input.targetModel) && input.mode === "create") return buildImagePrompt(input);

  const lang = input.language;
  const l = L[lang];
  const idx = lang === "it" ? 0 : 1;
  const bp = B[input.category] ?? B.Altro;
  const xml = input.targetModel === "claude";
  const parts: string[] = [];

  if (input.mode === "improve") return improvePrompt(input, patterns);

  parts.push(section(l.role, `${l.actAs} ${bp.role[idx]}.`, xml));
  parts.push(section(l.objective, input.goal.trim(), xml));
  parts.push(section(l.creative, CREATIVE[input.category][idx], xml));
  const ctx = [input.context?.trim() || l.noContext];
  if (input.audience?.trim()) ctx.push(`${l.audience}: ${input.audience.trim()}.`);
  parts.push(section(l.context, ctx.join("\n"), xml));

  const steps = [...l.steps];
  if (input.techniques.includes("stepByStep")) steps.push(l.tech.stepByStep);
  if (input.techniques.includes("selfCritique")) steps.push(l.tech.selfCritique);
  parts.push(section(l.method, steps.map((s, i) => `${i + 1}. ${s}`).join("\n"), xml));

  const reqs = [`${l.tone}: ${input.tone}.`, l.detail[input.detailLevel], ...bp.focus[idx], ...l.base];
  if (input.techniques.includes("clarify")) reqs.push(l.tech.clarify);
  if (input.techniques.includes("sources")) reqs.push(l.tech.sources);
  parts.push(section(l.requirements, reqs.map((r) => `- ${r}`).join("\n"), xml));

  if (patterns.length) parts.push(section(l.patterns, patterns.map((p) => `- ${p}`).join("\n"), xml));
  if (input.techniques.includes("examples")) parts.push(section(l.examples, l.tech.examples, xml));

  const out = [input.outputFormat?.trim() || bp.output[idx]];
  if (input.techniques.includes("variants")) out.push(l.tech.variants);
  parts.push(section(l.output, out.join("\n"), xml));
  parts.push(section(l.check, l.finalCheck, xml));

  return { result: parts.join("\n\n"), notes: [] as string[] };
}

/** Keeps the user's prompt intact and adds only what the analyzer finds missing. */
function improvePrompt(input: GenerateInput, patterns: string[]) {
  const lang = input.language;
  const l = L[lang];
  const idx = lang === "it" ? 0 : 1;
  const bp = B[input.category] ?? B.Altro;
  const xml = input.targetModel === "claude";
  const missing = new Set<CheckId>(analyzePrompt(input.goal).checks.filter((c) => !c.ok).map((c) => c.id));
  const parts: string[] = [];

  if (missing.has("role")) parts.push(section(l.role, `${l.actAs} ${bp.role[idx]}.`, xml));
  parts.push(section(l.objective, input.goal.trim(), xml));
  if (missing.has("context") || input.context?.trim() || input.audience?.trim()) {
    const ctx = [input.context?.trim() || (lang === "it" ? "Contesto: [DESCRIVI SITUAZIONE, SCOPO E VINCOLI]." : "Context: [DESCRIBE SITUATION, PURPOSE AND CONSTRAINTS].")];
    ctx.push(`${l.audience}: ${input.audience?.trim() || (lang === "it" ? "[PUBBLICO]" : "[AUDIENCE]")}.`);
    parts.push(section(l.context, ctx.join("\n"), xml));
  }
  const reqs: string[] = [];
  if (missing.has("tone")) reqs.push(`${l.tone}: ${input.tone}.`);
  if (missing.has("constraints")) reqs.push(...bp.focus[idx], ...l.base);
  reqs.push(l.detail[input.detailLevel]);
  if (input.techniques.includes("clarify")) reqs.push(l.tech.clarify);
  if (input.techniques.includes("stepByStep")) reqs.push(l.tech.stepByStep);
  if (input.techniques.includes("selfCritique")) reqs.push(l.tech.selfCritique);
  if (input.techniques.includes("sources")) reqs.push(l.tech.sources);
  parts.push(section(l.requirements, reqs.map((r) => `- ${r}`).join("\n"), xml));
  if (patterns.length) parts.push(section(l.patterns, patterns.map((p) => `- ${p}`).join("\n"), xml));
  if (missing.has("examples") || input.techniques.includes("examples")) parts.push(section(l.examples, l.tech.examples, xml));
  if (missing.has("format") || input.outputFormat?.trim() || input.techniques.includes("variants")) {
    const out = [input.outputFormat?.trim() || bp.output[idx]];
    if (input.techniques.includes("variants")) out.push(l.tech.variants);
    parts.push(section(l.output, out.join("\n"), xml));
  }
  if (missing.has("verification")) parts.push(section(l.check, l.finalCheck, xml));
  return { result: parts.join("\n\n"), notes: [] as string[] };
}

export async function enhanceWithHuggingFace(input: GenerateInput, draft: string) {
  const token = process.env.HF_TOKEN;
  if (!token) return { result: draft, provider: "local" as const };

  const image = isImageModel(input.targetModel);
  const instruction = image
    ? "You refine prompts for image generation models. Translate any non-English subject to English, keep every parameter (like --ar, --v, --no, 'Negative prompt:' sections) exactly, enrich visual detail. Return only the final prompt."
    : input.language === "it"
      ? "Sei un prompt engineer esperto. Migliora il prompt seguente mantenendo struttura, sezioni, segnaposto tra parentesi quadre e lingua italiana. Rendilo più preciso e specifico per l'obiettivo, senza aggiungere fatti inventati. Restituisci soltanto il prompt finale."
      : "You are an expert prompt engineer. Improve the following prompt while preserving its structure, sections, bracketed placeholders and English language. Make it more precise and specific to the goal without adding invented facts. Return only the final prompt.";

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.HF_MODEL || "Qwen/Qwen2.5-7B-Instruct",
        messages: [{ role: "system", content: instruction }, { role: "user", content: draft }],
        max_tokens: 1400,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return { result: draft, provider: "local" as const };
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const result = data.choices?.[0]?.message?.content?.trim().replace(/^```\w*\n?|```$/g, "").trim();
    // Guard against degenerate outputs: reject if the model dropped most of the content.
    return result && result.length > draft.length * 0.5 ? { result, provider: "huggingface" as const } : { result: draft, provider: "local" as const };
  } catch {
    return { result: draft, provider: "local" as const };
  }
}
