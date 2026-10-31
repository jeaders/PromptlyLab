"use client";

import { Bookmark, BrainCircuit, Check, ChevronDown, Copy, ExternalLink, LoaderCircle, Trash2, Users, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { analyzePrompt } from "@/lib/analyzer";
import { CATEGORIES, CATEGORY_LABELS, TARGET_MODELS, extractPlaceholders, isCategory, type Category, type Language } from "@/lib/catalog";
import type { Dict } from "@/lib/i18n";
import type { Generation, PromptItem } from "@/lib/types";
import { HighlightedPrompt, OPEN_IN, ScoreRing, catClass, categoryIcons, copyToClipboard } from "./ui";

const HISTORY_KEY = "promptly:history";

function loadItems(tab: "recent" | "fav"): Generation[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const all: Generation[] = raw ? JSON.parse(raw) : [];
    const filtered = tab === "fav" ? all.filter((x) => x.favorite) : all;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

function Sheet({ onClose, children, label, wide }: { onClose: () => void; children: ReactNode; label: string; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal sheet ${wide ? "wide" : ""}`} role="dialog" aria-modal="true" aria-label={label}>
        <span className="sheet-handle" aria-hidden="true" />
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        {children}
      </div>
    </div>
  );
}

export function PromptSheet({ prompt, lang, t, onClose, onUse }: { prompt: PromptItem; lang: Language; t: Dict; onClose: () => void; onUse: (text: string, category: string) => void }) {
  const content = lang === "it" ? prompt.content : prompt.contentEn;
  const placeholders = useMemo(() => extractPlaceholders(content), [content]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const filled = useMemo(() => placeholders.reduce((text, ph) => (values[ph]?.trim() ? text.split(ph).join(values[ph].trim()) : text), content), [content, placeholders, values]);
  const Icon = categoryIcons[prompt.category] ?? WandSparkles;

  async function copy() {
    if (await copyToClipboard(filled)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      void fetch(`/api/prompts/${prompt.id}`, { method: "PATCH" });
    }
  }

  return (
    <Sheet onClose={onClose} label={prompt.title} wide>
      <div className="sheet-title">
        <span className={`category-icon ${catClass(prompt.category)}`}><Icon size={20} /></span>
        <div>
          <small>{isCategory(prompt.category) ? CATEGORY_LABELS[prompt.category][lang] : prompt.category} · {prompt.model}</small>
          <h2>{lang === "it" ? prompt.title : prompt.titleEn}</h2>
        </div>
      </div>
      {prompt.source === "community" && (
        <p className="license-note"><Users size={13} />{t.communityLicense}{prompt.contributor ? ` · ${t.by} ${prompt.contributor}` : ""}{prompt.sourceUrl && <a href={prompt.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={12} /></a>}</p>
      )}
      <div className="sheet-body">
        {placeholders.length > 0 && (
          <div className="placeholder-form">
            <span className="field-label">{t.sheetPlaceholders}</span>
            <div>{placeholders.map((ph) => (
              <label key={ph}><small>{ph.slice(1, -1)}</small><input value={values[ph] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [ph]: e.target.value }))} placeholder={ph.slice(1, -1).toLowerCase()} /></label>
            ))}</div>
          </div>
        )}
        <div>
          <span className="field-label">{t.sheetPreview}</span>
          <pre className="sheet-pre"><HighlightedPrompt text={filled} /></pre>
        </div>
      </div>
      <div className="sheet-actions">
        <button className="primary-button" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? t.copied : placeholders.length ? t.copyFilled : t.copy}</button>
        <button className="ghost-button" onClick={() => onUse(filled, prompt.category)}><WandSparkles size={16} />{t.useInGenerator}</button>
      </div>
      <div className="open-in compact"><span>{t.openIn}</span>{OPEN_IN.map((o) => <a key={o.id} href={o.url(filled)} target="_blank" rel="noopener noreferrer">{o.label}<ExternalLink size={11} /></a>)}</div>
    </Sheet>
  );
}

export function HistorySheet({ lang, t, onClose, onToast }: { lang: Language; t: Dict; onClose: () => void; onToast: (m: string) => void }) {
  const [tab, setTab] = useState<"recent" | "fav">("recent");
  const [version, setVersion] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const items = loadItems(tab);

  async function toggleFav(g: Generation) {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const all: Generation[] = raw ? JSON.parse(raw) : [];
      const next = all.map((x) => (x.id === g.id ? { ...x, favorite: !x.favorite } : x));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setVersion((v) => v + 1);
    } catch { onToast(t.error); }
  }

  async function remove(id: number) {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const all: Generation[] = raw ? JSON.parse(raw) : [];
      const next = all.filter((x) => x.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      setVersion((v) => v + 1);
      onToast(t.deleted);
    } catch { onToast(t.error); }
  }

  async function copy(g: Generation) {
    if (await copyToClipboard(g.result)) { setCopiedId(g.id); setTimeout(() => setCopiedId(null), 1500); }
  }

  return (
    <Sheet onClose={onClose} label={t.historyTitle} wide>
      <h2 className="sheet-h2">{t.historyTitle}</h2>
      <div className="mode-tabs small">
        <button className={tab === "recent" ? "active" : ""} onClick={() => setTab("recent")}>{t.recent}</button>
        <button className={tab === "fav" ? "active" : ""} onClick={() => setTab("fav")}><Bookmark size={13} />{t.favorites}</button>
      </div>
      <div className="history-list">
      {items.length === 0 ? <p className="history-empty">{tab === "fav" ? t.favEmpty : t.historyEmpty}</p>
        : items.map((g) => {
            const model = TARGET_MODELS.find((m) => m.id === g.targetModel);
            return (
              <article key={g.id} className="history-item">
                <div className="history-meta">
                  {g.score > 0 && <ScoreRing score={g.score} size={34} />}
                  <div>
                    <b>{g.goal.replace(/\s+/g, " ").slice(0, 90)}{g.goal.length > 90 ? "…" : ""}</b>
                    <small>{new Date(g.createdAt).toLocaleString(lang, { dateStyle: "medium", timeStyle: "short" })} · {model ? (lang === "it" ? model.label : model.labelEn) : g.targetModel}{g.mode === "improve" ? ` · ${t.modeImprove}` : ""}{g.learned ? ` · ${t.learnedThis}` : ""}</small>
                  </div>
                </div>
                <p>{g.result.slice(0, 220)}{g.result.length > 220 ? "…" : ""}</p>
                <div className="history-actions">
                  <button onClick={() => copy(g)}>{copiedId === g.id ? <Check size={14} /> : <Copy size={14} />}{copiedId === g.id ? t.copied : t.copy}</button>
                  <button onClick={() => toggleFav(g)} className={g.favorite ? "is-favorite" : ""} aria-label={t.save}><Bookmark size={14} fill={g.favorite ? "currentColor" : "none"} /></button>
                  <button onClick={() => remove(g.id)} aria-label={t.delete} className="danger"><Trash2 size={14} /></button>
                </div>
              </article>
            );
          })}
      </div>
    </Sheet>
  );
}

export function LearnModal({ lang, t, onClose, onLearned, onToast }: { lang: Language; t: Dict; onClose: () => void; onLearned: () => void; onToast: (m: string) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("Altro");
  const [saving, setSaving] = useState(false);
  const analysis = useMemo(() => (content.trim() ? analyzePrompt(content) : null), [content]);

  async function submit() {
    if (!title.trim() || content.trim().length < 30) return onToast(t.learnShort);
    setSaving(true);
    try {
      const r = await fetch("/api/prompts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content, category, language: lang }) });
      if (!r.ok) throw new Error();
      onToast(t.learned);
      onLearned();
      onClose();
    } catch { onToast(t.error); } finally { setSaving(false); }
  }

  return (
    <Sheet onClose={onClose} label={t.learnTitle}>
      <span className="modal-icon"><BrainCircuit size={24} /></span>
      <h2>{t.learnTitle}</h2>
      <p>{t.learnText}</p>
      <label><span className="field-label">{t.promptTitle}</span><input value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} placeholder={t.promptTitlePlaceholder} /></label>
      <label><span className="field-label">{t.category}</span><div className="select-wrap"><select value={category} onChange={(e) => isCategory(e.target.value) && setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c][lang]}</option>)}</select><ChevronDown size={16} /></div></label>
      <label><span className="field-label"><span>{t.promptContent}</span>{analysis && <small>{t.score}: {analysis.score}/100</small>}</span><textarea value={content} maxLength={8000} onChange={(e) => setContent(e.target.value)} placeholder={t.promptContentPlaceholder} /></label>
      <div className="modal-actions">
        <button onClick={onClose}>{t.cancel}</button>
        <button className="primary-button" disabled={saving} onClick={submit}>{saving ? <LoaderCircle className="spin" size={17} /> : <BrainCircuit size={17} />} {t.addLibrary}</button>
      </div>
    </Sheet>
  );
}
