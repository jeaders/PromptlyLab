"use client";

import {
  ArrowRight, BookmarkPlus, BrainCircuit, Bookmark, Check, ChevronDown, Copy, Download, ExternalLink,
  Info, LoaderCircle, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, WandSparkles, Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { analyzePrompt, CHECK_LABELS } from "@/lib/analyzer";
import {
  ASPECT_RATIOS, CATEGORIES, CATEGORY_LABELS, TARGET_MODELS, TECHNIQUES, TONES,
  isCategory, isImageModel, type AspectRatio, type Category, type Language, type TargetModel, type Technique,
} from "@/lib/catalog";
import type { Dict } from "@/lib/i18n";
import type { GenerateResponse, Generation, Preset } from "@/lib/types";
import { HighlightedPrompt, OPEN_IN, ScoreRing, copyToClipboard } from "./ui";

const HISTORY_KEY = "promptly:history";

type Props = {
  lang: Language; t: Dict; preset: Preset | null;
  onToast: (msg: string) => void; onGenerated: () => void; onOpenReference: (id: number) => void;
};

export default function Generator({ lang, t, preset, onToast, onGenerated, onOpenReference }: Props) {
  const [mode, setMode] = useState<"create" | "improve">(preset?.mode ?? "create");
  const [goal, setGoal] = useState(preset?.goal ?? "");
  const [category, setCategory] = useState<Category>(isCategory(preset?.category) ? preset.category : "Marketing");
  const [tone, setTone] = useState("Professionale");
  const [detail, setDetail] = useState<"concise" | "balanced" | "deep">("balanced");
  const [targetModel, setTargetModel] = useState<TargetModel>("universal");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [advanced, setAdvanced] = useState(Boolean(preset));
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<GenerateResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [learnedId, setLearnedId] = useState<number | null>(null);

  const image = isImageModel(targetModel) && mode === "create";
  const live = useMemo(() => (mode === "improve" && goal.trim().length > 0 ? analyzePrompt(goal) : null), [goal, mode]);

  function toggleTechnique(id: Technique) {
    setTechniques((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  function chooseModel(id: TargetModel) {
    setTargetModel(id);
    if (isImageModel(id)) setCategory("Immagini");
  }

  function saveToHistory(res: GenerateResponse) {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const all: Generation[] = raw ? JSON.parse(raw) : [];
      const entry: Generation = {
        id: res.generation.id,
        goal,
        result: res.generation.result,
        category,
        targetModel,
        mode,
        score: res.analysis?.score ?? 0,
        favorite: res.generation.favorite,
        learned: res.generation.learned,
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...all.filter((x) => x.id !== entry.id)];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 200)));
    } catch { /* storage unavailable */ }
  }

  async function generate() {
    if (goal.trim().length < 8) return onToast(t.goalShort);
    setLoading(true);
    setRes(null);
    setLearnedId(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, category, tone, language: lang, detailLevel: detail, context, audience, outputFormat, targetModel, techniques, aspectRatio, mode }),
      });
      if (!response.ok) throw new Error();
      const saved = (await response.json()) as GenerateResponse;
      setRes(saved);
      onGenerated();
      saveToHistory(saved);
      requestAnimationFrame(() => document.getElementById("result-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
    } catch {
      onToast(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!res) return;
    if (await copyToClipboard(res.generation.result)) { setCopied(true); setTimeout(() => setCopied(false), 1600); }
  }

  async function toggleFavorite() {
    if (!res) return;
    const favorite = !res.generation.favorite;
    setRes({ ...res, generation: { ...res.generation, favorite } });
    const r = await fetch(`/api/generations/${res.generation.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorite }) });
    if (!r.ok) { onToast(t.error); setRes((cur) => (cur ? { ...cur, generation: { ...cur.generation, favorite: !favorite } } : cur)); }
  }

  async function learnResult() {
    if (!res || learnedId) return;
    const title = goal.replace(/\s+/g, " ").trim().slice(0, 70) + (goal.length > 70 ? "…" : "");
    const r = await fetch("/api/prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content: res.generation.result, category, language: lang }) });
    if (!r.ok) return onToast(t.error);
    const data = (await r.json()) as { item: { id: number } };
    setLearnedId(data.item.id);
    void fetch(`/api/generations/${res.generation.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ learned: true }) });
    onToast(t.learned);
    onGenerated();
  }

  function download() {
    if (!res) return;
    const url = URL.createObjectURL(new Blob([res.generation.result], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptly-${res.generation.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const placeholder = mode === "improve" ? t.goalPlaceholderImprove : image ? t.imagePlaceholder : t.goalPlaceholder;

  return (
    <div className={`generator-shell ${res ? "has-result" : ""}`}>
      <div className="builder-card">
        <div className="mode-tabs" role="tablist">
          <button role="tab" aria-selected={mode === "create"} className={mode === "create" ? "active" : ""} onClick={() => setMode("create")}><WandSparkles size={15} />{t.modeCreate}</button>
          <button role="tab" aria-selected={mode === "improve"} className={mode === "improve" ? "active" : ""} onClick={() => setMode("improve")}><Sparkles size={15} />{t.modeImprove}</button>
        </div>

        <label className="field-label" htmlFor="goal"><span>{mode === "improve" ? t.goalLabelImprove : t.goalLabel}</span><small>{goal.length}/6000</small></label>
        <textarea id="goal" className={`goal-input ${mode === "improve" ? "mono" : ""}`} value={goal} maxLength={6000} onChange={(e) => setGoal(e.target.value)} placeholder={placeholder} />

        {live ? (
          <div className="live-score">
            <ScoreRing score={live.score} size={44} />
            <div>
              <b>{t.liveScore}</b>
              <div className="missing-list">
                {live.checks.filter((c) => !c.ok).slice(0, 4).map((c) => <span key={c.id} title={lang === "it" ? CHECK_LABELS[c.id].tipIt : CHECK_LABELS[c.id].tipEn}>+ {CHECK_LABELS[c.id][lang]}</span>)}
                {live.checks.every((c) => c.ok) && <span className="ok"><Check size={11} /> OK</span>}
              </div>
            </div>
          </div>
        ) : <p className="input-hint"><Sparkles size={13} />{t.charHint}</p>}

        <span className="field-label">{t.targetModel}</span>
        <div className="model-chips">
          {TARGET_MODELS.map((m) => (
            <button key={m.id} className={targetModel === m.id ? "active" : ""} onClick={() => chooseModel(m.id)}>
              {m.kind === "image" && <span className="dot-img" />}{lang === "it" ? m.label : m.labelEn}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <label><span className="field-label">{t.category}</span><div className="select-wrap"><select value={category} onChange={(e) => isCategory(e.target.value) && setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c][lang]}</option>)}</select><ChevronDown size={16} /></div></label>
          <label><span className="field-label">{t.tone}</span><div className="select-wrap"><select value={tone} onChange={(e) => setTone(e.target.value)}>{TONES.map((x) => <option key={x.v} value={x.v}>{x[lang]}</option>)}</select><ChevronDown size={16} /></div></label>
        </div>

        {image && (
          <div className="aspect-row"><span className="field-label">{t.aspect}</span><div className="segment-control five">{ASPECT_RATIOS.map((a) => <button key={a} className={aspectRatio === a ? "active" : ""} onClick={() => setAspectRatio(a)}>{a}</button>)}</div></div>
        )}

        <button className="advanced-toggle" onClick={() => setAdvanced(!advanced)} aria-expanded={advanced}><SlidersHorizontal size={16} />{t.advanced}<ChevronDown className={advanced ? "rotated" : ""} size={16} /></button>
        {advanced && (
          <div className="advanced-panel">
            <div><span className="field-label">{t.detail}</span><div className="segment-control">{(["concise", "balanced", "deep"] as const).map((x) => <button key={x} className={detail === x ? "active" : ""} onClick={() => setDetail(x)}>{t[x]}</button>)}</div></div>
            {!image && (
              <div><span className="field-label">{t.techniques}</span><div className="technique-chips">{TECHNIQUES.map((x) => <button key={x.id} className={techniques.includes(x.id) ? "active" : ""} onClick={() => toggleTechnique(x.id)}>{techniques.includes(x.id) && <Check size={12} />}{x[lang]}</button>)}</div></div>
            )}
            <label><span className="field-label">{t.context}</span><textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder={t.contextPlaceholder} maxLength={3000} /></label>
            {!image && <label><span className="field-label">{t.audience}</span><input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t.audiencePlaceholder} maxLength={300} /></label>}
            {!image && <label><span className="field-label">{t.output}</span><input value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} placeholder={t.outputPlaceholder} maxLength={1000} /></label>}
          </div>
        )}

        <button className="generate-button" onClick={generate} disabled={loading}>
          {loading ? <><LoaderCircle className="spin" size={19} />{t.generating}</> : <><WandSparkles size={19} />{mode === "improve" ? t.improve : t.generate}<ArrowRight size={18} /></>}
        </button>
      </div>

      {res && (
        <div className="result-card" id="result-panel">
          <div className="result-head">
            <div>
              {res.analysis ? <ScoreRing score={res.analysis.score} /> : <span className="success-dot"><Check size={15} /></span>}
              <div><h3>{res.generation.mode === "improve" ? t.readyImproved : t.ready}</h3><p>{res.scoreBefore !== null && res.analysis ? `${t.before} ${res.scoreBefore} → ${t.after} ${res.analysis.score}` : t.readySub}</p></div>
            </div>
            <span className="provider-badge"><Zap size={12} />{res.provider === "huggingface" ? t.ai : t.local}</span>
          </div>

          <pre><HighlightedPrompt text={res.generation.result} /></pre>

          <div className="result-actions">
            <button className="copy-main" onClick={copyResult}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t.copied : t.copy}</button>
            <button onClick={toggleFavorite} className={res.generation.favorite ? "is-favorite" : ""} aria-label={t.save}><Bookmark size={17} fill={res.generation.favorite ? "currentColor" : "none"} /><span>{res.generation.favorite ? t.saved : t.save}</span></button>
            <button onClick={learnResult} className={learnedId ? "is-favorite" : ""} aria-label={t.learnThis}>{learnedId ? <Check size={17} /> : <BookmarkPlus size={17} />}<span>{learnedId ? t.learnedThis : t.learnThis}</span></button>
            <button onClick={download} aria-label={t.download}><Download size={17} /><span>{t.download}</span></button>
            <button onClick={() => { setRes(null); setGoal(""); }} aria-label={t.newPrompt}><RotateCcw size={17} /><span>{t.newPrompt}</span></button>
          </div>

          {!isImageModel(targetModel) && (
            <div className="open-in"><span>{t.openIn}</span>{OPEN_IN.map((o) => <a key={o.id} href={o.url(res.generation.result)} target="_blank" rel="noopener noreferrer">{o.label}<ExternalLink size={11} /></a>)}</div>
          )}

          {res.notes.includes("image-english") && <div className="note"><Info size={14} />{t.imageEnglish}</div>}

          {res.analysis && (
            <div className="quality-panel">
              <b><ShieldCheck size={16} />{t.quality}</b>
              <div>{res.analysis.checks.map((c) => <span key={c.id} className={c.ok ? "" : "off"}>{c.ok ? <Check size={12} /> : <i>·</i>}{CHECK_LABELS[c.id][lang]}</span>)}</div>
            </div>
          )}

          {!image && (
            <div className="refs">
              <b><BrainCircuit size={15} />{t.inspired}{res.patternsUsed > 0 && <small>· {res.patternsUsed} {t.patterns}</small>}</b>
              {res.references.length ? (
                <div>{res.references.map((r) => <button key={r.id} onClick={() => onOpenReference(r.id)}>{lang === "it" ? r.title : r.titleEn}<ArrowRight size={12} /></button>)}</div>
              ) : <p>{t.noRefs}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
