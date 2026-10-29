export type CheckId = "role" | "task" | "context" | "constraints" | "format" | "examples" | "tone" | "verification" | "length";

export type Check = { id: CheckId; ok: boolean; weight: number };
export type Analysis = { score: number; checks: Check[]; words: number };

const rules: Array<{ id: Exclude<CheckId, "length">; weight: number; re: RegExp }> = [
  { id: "role", weight: 15, re: /(agisci come|comportati come|sei un|sei una|sei l'|nel ruolo|ruolo|act as|you are an?|i want you to act|acting as|role)/i },
  { id: "task", weight: 15, re: /(scrivi|crea|genera|analizza|progetta|spiega|riassumi|traduci|pianifica|valuta|obiettivo|compito|write|create|generate|analy[sz]e|design|explain|summari[sz]e|translate|plan|build|evaluate|objective|task|goal)/i },
  { id: "context", weight: 15, re: /(contesto|context|pubblico|audience|target|destinatar|background|situazione|scenario|per conto di|for an? \w+ (team|company|audience|client))/i },
  { id: "constraints", weight: 15, re: /(\bnon\b|evita|avoid|never|do not|don't|must|deve|devi|limite|limit|massimo|max(imum)?|requisit|requirement|constraint|vincol|only|solo)/i },
  { id: "format", weight: 15, re: /(formato|format|output|tabella|table|elenco|list|bullet|json|markdown|sezion|section|struttura|structure|headings|titoli|parole|words)/i },
  { id: "examples", weight: 8, re: /(esempio|esempi|example|e\.g\.|ad esempio|\bes\.|few-shot|like this)/i },
  { id: "tone", weight: 7, re: /(\btono\b|\btone\b|stile|style|voce|voice|registro|formale|informal|friendly|amichevole)/i },
  { id: "verification", weight: 5, re: /(verifica|controlla|rivedi|assicurati|check|review|ensure|verify|quality|qualità|criteri|criteria)/i },
];

export function analyzePrompt(text: string): Analysis {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  const checks: Check[] = rules.map((r) => ({ id: r.id, weight: r.weight, ok: r.re.test(clean) }));
  checks.push({ id: "length", weight: 5, ok: words >= 40 && words <= 1200 });
  const raw = checks.reduce((sum, c) => sum + (c.ok ? c.weight : 0), 0);
  // Very short inputs cannot be "excellent" even if they hit keywords.
  const score = words < 12 ? Math.min(raw, 35) : raw;
  return { score, checks, words };
}

export const CHECK_LABELS: Record<CheckId, { it: string; en: string; tipIt: string; tipEn: string }> = {
  role: { it: "Ruolo definito", en: "Role defined", tipIt: "Indica chi deve essere l'AI (es. “Agisci come…”).", tipEn: "Tell the AI who to be (e.g. “Act as…”)." },
  task: { it: "Compito chiaro", en: "Clear task", tipIt: "Usa un verbo d'azione e un obiettivo preciso.", tipEn: "Use an action verb and a precise goal." },
  context: { it: "Contesto e pubblico", en: "Context & audience", tipIt: "Spiega situazione, pubblico e scopo.", tipEn: "Explain situation, audience and purpose." },
  constraints: { it: "Vincoli espliciti", en: "Explicit constraints", tipIt: "Aggiungi cosa evitare, limiti e requisiti.", tipEn: "Add what to avoid, limits and requirements." },
  format: { it: "Formato di output", en: "Output format", tipIt: "Specifica struttura, lunghezza o formato.", tipEn: "Specify structure, length or format." },
  examples: { it: "Esempi", en: "Examples", tipIt: "Un esempio dell'output desiderato migliora molto la precisione.", tipEn: "An example of the desired output boosts precision." },
  tone: { it: "Tono e stile", en: "Tone & style", tipIt: "Definisci il tono di voce.", tipEn: "Define the tone of voice." },
  verification: { it: "Verifica finale", en: "Final check", tipIt: "Chiedi all'AI di controllare il risultato.", tipEn: "Ask the AI to check its result." },
  length: { it: "Lunghezza adeguata", en: "Adequate length", tipIt: "Punta a 40–1200 parole: abbastanza contesto, niente rumore.", tipEn: "Aim for 40–1200 words: enough context, no noise." },
};
