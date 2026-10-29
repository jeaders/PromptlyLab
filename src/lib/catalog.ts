export type Language = "it" | "en";

export const CATEGORIES = [
  "Marketing", "Scrittura", "Immagini", "Video", "Audio", "Sviluppo", "Dati", "Design",
  "Business", "Ricerca", "Studio", "Produttività", "Carriera", "Lifestyle", "Giochi", "Altro",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category | "Tutti", { it: string; en: string }> = {
  Tutti: { it: "Tutti", en: "All" },
  Marketing: { it: "Marketing", en: "Marketing" },
  Scrittura: { it: "Scrittura", en: "Writing" },
  Immagini: { it: "Immagini", en: "Images" },
  Video: { it: "Video", en: "Video" },
  Audio: { it: "Audio & Musica", en: "Audio & Music" },
  Sviluppo: { it: "Sviluppo", en: "Development" },
  Dati: { it: "Dati & Analisi", en: "Data & Analytics" },
  Design: { it: "Design & UX", en: "Design & UX" },
  Business: { it: "Business", en: "Business" },
  Ricerca: { it: "Ricerca", en: "Research" },
  Studio: { it: "Studio", en: "Learning" },
  Produttività: { it: "Produttività", en: "Productivity" },
  Carriera: { it: "Carriera", en: "Career" },
  Lifestyle: { it: "Lifestyle", en: "Lifestyle" },
  Giochi: { it: "Giochi & Storie", en: "Games & Stories" },
  Altro: { it: "Altro", en: "Other" },
};

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}

export const TARGET_MODELS = [
  { id: "universal", label: "Universale", labelEn: "Universal", kind: "text" },
  { id: "chatgpt", label: "ChatGPT", labelEn: "ChatGPT", kind: "text" },
  { id: "claude", label: "Claude", labelEn: "Claude", kind: "text" },
  { id: "gemini", label: "Gemini", labelEn: "Gemini", kind: "text" },
  { id: "midjourney", label: "Midjourney", labelEn: "Midjourney", kind: "image" },
  { id: "stable-diffusion", label: "Stable Diffusion / Flux", labelEn: "Stable Diffusion / Flux", kind: "image" },
  { id: "dalle", label: "DALL·E / GPT Image", labelEn: "DALL·E / GPT Image", kind: "image" },
] as const;
export type TargetModel = (typeof TARGET_MODELS)[number]["id"];

export function isTargetModel(value: unknown): value is TargetModel {
  return TARGET_MODELS.some((m) => m.id === value);
}
export function isImageModel(id: TargetModel) {
  return TARGET_MODELS.find((m) => m.id === id)?.kind === "image";
}

export const TECHNIQUES = [
  { id: "clarify", it: "Domande preliminari", en: "Clarifying questions" },
  { id: "stepByStep", it: "Ragionamento a step", en: "Step-by-step reasoning" },
  { id: "examples", it: "Esempi (few-shot)", en: "Examples (few-shot)" },
  { id: "selfCritique", it: "Autocritica", en: "Self-critique" },
  { id: "variants", it: "3 varianti", en: "3 variants" },
  { id: "sources", it: "Cita le fonti", en: "Cite sources" },
] as const;
export type Technique = (typeof TECHNIQUES)[number]["id"];

export const ASPECT_RATIOS = ["1:1", "4:5", "3:2", "16:9", "9:16"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const TONES = [
  { v: "Professionale", it: "Professionale", en: "Professional" },
  { v: "Amichevole", it: "Amichevole", en: "Friendly" },
  { v: "Persuasivo", it: "Persuasivo", en: "Persuasive" },
  { v: "Creativo", it: "Creativo", en: "Creative" },
  { v: "Tecnico", it: "Tecnico", en: "Technical" },
  { v: "Accademico", it: "Accademico", en: "Academic" },
  { v: "Ironico", it: "Ironico", en: "Witty" },
  { v: "Empatico", it: "Empatico", en: "Empathetic" },
] as const;

/** Extract unique [PLACEHOLDER] / {placeholder} tokens from a prompt. */
export function extractPlaceholders(text: string) {
  const found = new Set<string>();
  for (const match of text.matchAll(/\[([^\[\]\n]{2,40})\]/g)) found.add(match[0]);
  return [...found].slice(0, 12);
}
