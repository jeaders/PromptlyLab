export type SeedPrompt = {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  content: string;
  contentEn: string;
  category: string;
  tags: string[];
  model: string;
  featured: boolean;
  uses: number;
};

export const seedPrompts: SeedPrompt[] = [
  {
    title: "Stratega di contenuti virali", titleEn: "Viral content strategist",
    description: "Un piano editoriale ad alta ritenzione per qualsiasi nicchia.", descriptionEn: "A high-retention editorial plan for any niche.",
    category: "Marketing", tags: ["social", "contenuti", "strategia"], model: "ChatGPT", featured: true, uses: 0,
    content: `Agisci come un content strategist senior specializzato in crescita organica. Crea un piano editoriale di 30 giorni per [BRAND/NICCHIA] rivolto a [PUBBLICO]. Obiettivo: [OBIETTIVO]. Per ogni contenuto indica: hook entro 8 parole, formato, idea centrale, CTA e metrica primaria. Alterna contenuti educativi, autorevoli, relazionali e conversione. Mantieni il tono [TONO], evita cliché e promesse non verificabili. Presenta prima 3 insight strategici, poi una tabella settimanale e infine 5 esperimenti A/B.`,
    contentEn: `Act as a senior content strategist specializing in organic growth. Create a 30-day editorial plan for [BRAND/NICHE] targeting [AUDIENCE]. Goal: [GOAL]. For each piece include: hook under 8 words, format, central idea, CTA, and primary metric. Mix educational, authority, relational, and conversion content. Keep a [TONE] voice, avoid clichés and unverifiable claims. Present 3 strategic insights, a weekly table, and 5 A/B experiments.`,
  },
  {
    title: "Art director per immagini AI", titleEn: "AI image art director",
    description: "Prompt fotografici cinematografici, precisi e controllabili.", descriptionEn: "Cinematic, precise and controllable photography prompts.",
    category: "Immagini", tags: ["midjourney", "design", "fotografia"], model: "Midjourney", featured: true, uses: 0,
    content: `Crea un prompt di art direction per generare [SOGGETTO]. Scena: [AMBIENTE]. Composizione: [INQUADRATURA], regola dei terzi, profondità stratificata. Illuminazione: [LUCE], temperatura colore [CALDA/FREDDA]. Look: fotografia editoriale premium, texture realistiche, dettagli naturali, color grading [PALETTE], obiettivo [LENTE]. Includi atmosfera, gesto, materiali e rapporto d'aspetto. Negative prompt: testo, watermark, anatomia errata, artefatti, pelle plastica, elementi duplicati.`,
    contentEn: `Create an art-direction prompt to generate [SUBJECT]. Scene: [SETTING]. Composition: [FRAMING], rule of thirds, layered depth. Lighting: [LIGHT], [WARM/COOL] color temperature. Look: premium editorial photography, realistic textures, natural detail, [PALETTE] color grade, [LENS]. Include mood, gesture, materials, and aspect ratio. Negative prompt: text, watermark, bad anatomy, artifacts, plastic skin, duplicate elements.`,
  },
  {
    title: "Senior developer & code reviewer", titleEn: "Senior developer & code reviewer",
    description: "Progetta, implementa e verifica software production-ready.", descriptionEn: "Design, implement and verify production-ready software.",
    category: "Sviluppo", tags: ["coding", "debug", "architettura"], model: "Claude", featured: true, uses: 0,
    content: `Agisci come principal software engineer. Devi realizzare [FUNZIONALITÀ] usando [STACK]. Prima elenca assunzioni, casi limite e criteri di accettazione. Proponi un'architettura minima ma scalabile, quindi scrivi codice completo, tipizzato e accessibile. Includi gestione errori, sicurezza, test essenziali e istruzioni di verifica. Non inventare API: segnala ogni incertezza. Concludi con una code review critica e 3 miglioramenti ordinati per impatto.`,
    contentEn: `Act as a principal software engineer. Build [FEATURE] using [STACK]. First list assumptions, edge cases, and acceptance criteria. Propose a minimal yet scalable architecture, then write complete, typed, accessible code. Include error handling, security, essential tests, and verification steps. Never invent APIs: flag uncertainty. End with a critical code review and 3 improvements ranked by impact.`,
  },
  {
    title: "Analista di ricerca profonda", titleEn: "Deep research analyst",
    description: "Sintesi rigorose, fonti verificabili e insight azionabili.", descriptionEn: "Rigorous synthesis, verifiable sources and actionable insights.",
    category: "Ricerca", tags: ["analisi", "fonti", "report"], model: "Perplexity", featured: false, uses: 0,
    content: `Conduci una ricerca strutturata su [ARGOMENTO] per supportare [DECISIONE]. Separa fatti, interpretazioni e ipotesi. Usa fonti primarie recenti quando possibile, cita titolo, autore, data e URL. Confronta almeno 3 prospettive, evidenzia conflitti tra fonti, limiti dei dati e livello di confidenza. Output: sintesi esecutiva, evidenze chiave, tabella comparativa, rischi, opportunità e 5 raccomandazioni operative.`,
    contentEn: `Conduct structured research on [TOPIC] to support [DECISION]. Separate facts, interpretations, and hypotheses. Prefer recent primary sources; cite title, author, date, and URL. Compare at least 3 perspectives, highlight source conflicts, data limitations, and confidence. Output: executive summary, key evidence, comparison table, risks, opportunities, and 5 actionable recommendations.`,
  },
  {
    title: "Copywriter per landing page", titleEn: "Landing page copywriter",
    description: "Copy persuasivo, specifico e orientato alla conversione.", descriptionEn: "Persuasive, specific and conversion-focused copy.",
    category: "Scrittura", tags: ["copywriting", "landing", "conversione"], model: "Universale", featured: true, uses: 0,
    content: `Agisci come conversion copywriter. Scrivi la landing page per [PRODOTTO] destinata a [TARGET]. Trasforma caratteristiche in benefici concreti senza hype. Struttura: eyebrow, headline con outcome, subheadline, CTA, problema, meccanismo unico, 3 benefici con prove, come funziona, obiezioni, FAQ e CTA finale. Tono [TONO]. Proponi 3 varianti di headline e microcopy per form ed errori. Non usare “rivoluzionario”, “game changer” o superlativi vaghi.`,
    contentEn: `Act as a conversion copywriter. Write a landing page for [PRODUCT] aimed at [TARGET]. Turn features into concrete benefits without hype. Structure: eyebrow, outcome headline, subheadline, CTA, problem, unique mechanism, 3 benefits with proof, how it works, objections, FAQ, and final CTA. [TONE] voice. Offer 3 headline options plus form and error microcopy. Avoid “revolutionary,” “game changer,” and vague superlatives.`,
  },
  {
    title: "Tutor di apprendimento accelerato", titleEn: "Accelerated learning tutor",
    description: "Un percorso adattivo con pratica e feedback continuo.", descriptionEn: "An adaptive path with practice and continuous feedback.",
    category: "Studio", tags: ["studio", "tutor", "apprendimento"], model: "Gemini", featured: false, uses: 0,
    content: `Sei un tutor socratico esperto in [MATERIA]. Portami da [LIVELLO] a [OBIETTIVO] in [TEMPO]. Inizia con 5 domande diagnostiche, poi crea una mappa delle competenze e un piano settimanale. Spiega con analogie semplici, esempi concreti e progressiva complessità. Dopo ogni concetto fammi una domanda, attendi la risposta e correggi senza giudicare. Usa richiamo attivo, ripetizione dilazionata e mini-progetti.`,
    contentEn: `You are a Socratic tutor in [SUBJECT]. Take me from [LEVEL] to [GOAL] in [TIME]. Start with 5 diagnostic questions, then create a skill map and weekly plan. Explain with simple analogies, concrete examples, and progressive complexity. After each concept ask one question, wait, and correct without judgment. Use active recall, spaced repetition, and mini-projects.`,
  },
  {
    title: "Product manager strategico", titleEn: "Strategic product manager",
    description: "Trasforma un'idea in roadmap validabile e misurabile.", descriptionEn: "Turn an idea into a testable, measurable roadmap.",
    category: "Business", tags: ["product", "roadmap", "startup"], model: "ChatGPT", featured: false, uses: 0,
    content: `Agisci come product leader. Valuta questa idea: [IDEA]. Target: [UTENTI], mercato: [MERCATO]. Definisci problema, job-to-be-done, alternative attuali e ipotesi più rischiose. Progetta un MVP realizzabile in 4 settimane, specifica cosa escludere, eventi analytics e north-star metric. Crea roadmap Now/Next/Later, matrice impatto-sforzo e 5 interviste di validazione senza domande tendenziose.`,
    contentEn: `Act as a product leader. Assess this idea: [IDEA]. Target: [USERS], market: [MARKET]. Define the problem, job-to-be-done, current alternatives, and riskiest assumptions. Design a 4-week MVP, state exclusions, analytics events, and north-star metric. Create a Now/Next/Later roadmap, impact-effort matrix, and 5 unbiased validation interview questions.`,
  },
  {
    title: "Regista video short-form", titleEn: "Short-form video director",
    description: "Script dinamici per Reels, TikTok e Shorts.", descriptionEn: "Dynamic scripts for Reels, TikTok and Shorts.",
    category: "Video", tags: ["reels", "tiktok", "script"], model: "Universale", featured: false, uses: 0,
    content: `Scrivi uno script verticale di [DURATA] su [TEMA] per [PUBBLICO]. Apri con un pattern interrupt visivo e verbale entro 2 secondi. Struttura ogni beat con timestamp, parlato, B-roll, testo a schermo e sound cue. Mantieni frasi brevi, crea un open loop e chiudilo prima della CTA. Fornisci 3 hook alternativi, caption SEO naturale e una versione senza voce.`,
    contentEn: `Write a [DURATION] vertical video script about [TOPIC] for [AUDIENCE]. Open with a visual and verbal pattern interrupt within 2 seconds. Structure each beat with timestamp, dialogue, B-roll, on-screen text, and sound cue. Use short lines, create an open loop, and close it before the CTA. Provide 3 alternate hooks, a natural SEO caption, and a voice-free version.`,
  },
];

export const categoryMeta = [
  { id: "Tutti", icon: "Sparkles", color: "violet" },
  { id: "Marketing", icon: "Megaphone", color: "orange" },
  { id: "Immagini", icon: "Image", color: "pink" },
  { id: "Sviluppo", icon: "Code2", color: "cyan" },
  { id: "Scrittura", icon: "PenLine", color: "emerald" },
  { id: "Business", icon: "Briefcase", color: "blue" },
  { id: "Ricerca", icon: "Search", color: "amber" },
  { id: "Studio", icon: "GraduationCap", color: "indigo" },
  { id: "Video", icon: "Clapperboard", color: "rose" },
] as const;
