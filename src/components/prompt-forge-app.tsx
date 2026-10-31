"use client";

import { ArrowRight, BookOpen, BrainCircuit, Check, History, Languages, Library as LibraryIcon, Menu, ShieldCheck, Sparkles, WandSparkles, X, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/catalog";
import { dictionaries } from "@/lib/i18n";
import type { Preset, PromptItem, Stats } from "@/lib/types";
import Generator from "./generator";
import Library from "./library";
import { HistorySheet, LearnModal, PromptSheet } from "./sheets";

const FAV_KEY = "promptly:favorites";
const LANG_KEY = "promptly:lang";

export default function PromptForgeApp() {
  const [lang, setLang] = useState<Language>("it");
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [openPrompt, setOpenPrompt] = useState<PromptItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showLearn, setShowLearn] = useState(false);
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  const generatorRef = useRef<HTMLElement>(null);
  const libraryRef = useRef<HTMLElement>(null);
  const t = dictionaries[lang];

  // Restore persisted preferences after hydration.
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang === "it" || savedLang === "en") setLang(savedLang);
      const favs = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]") as unknown;
      if (Array.isArray(favs)) setFavorites(favs.filter((x): x is number => Number.isInteger(x)));
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch("/api/stats");
      if (r.ok) setStats((await r.json()) as Stats);
    } catch { /* stats are non-critical */ }
  }, []);

  useEffect(() => { void loadStats(); }, [loadStats, refreshKey]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 3200); return () => clearTimeout(id); }, [toast]);

  const notify = useCallback((msg: string) => setToast(msg), []);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const statsOnly = useCallback(() => void loadStats(), [loadStats]);
  const closePrompt = useCallback(() => setOpenPrompt(null), []);
  const closeHistory = useCallback(() => setShowHistory(false), []);
  const closeLearn = useCallback(() => setShowLearn(false), []);

  function toggleFavorite(id: number) {
    setFavorites((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenu(false);
  }

  function sendToGenerator(text: string, category: string) {
    setPreset({ nonce: Date.now(), goal: text, category, mode: "improve" });
    setOpenPrompt(null);
    setTimeout(() => scrollTo(generatorRef), 50);
  }

  const openReference = useCallback(async (id: number) => {
    try {
      const r = await fetch(`/api/prompts?ids=${id}`);
      const data = (await r.json()) as { items: PromptItem[] };
      if (data.items[0]) setOpenPrompt(data.items[0]);
    } catch { setToast(t.error); }
  }, [t.error]);

  const fmt = (n?: number) => (typeof n === "number" ? n.toLocaleString(lang) : "—");

  return (
    <main>
      <a href="#top" className="skip-link" tabIndex={0}>
        Vai al contenuto principale
      </a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Promptly home"><span className="brand-mark"><Sparkles size={18} /></span><span>promptly</span><i>lab</i></a>
        <nav className="desktop-nav" aria-label="Primary">
          <button onClick={() => scrollTo(generatorRef)}>{t.navCreate}</button>
          <button onClick={() => scrollTo(libraryRef)}>{t.library}</button>
          <button onClick={() => setShowHistory(true)}>{t.history}</button>
          <button onClick={() => setShowLearn(true)}>{t.learn}</button>
        </nav>
        <div className="header-actions">
          <button className="language-switch" onClick={() => setLang(lang === "it" ? "en" : "it")} aria-label={lang === "it" ? "Switch to English" : "Passa all'italiano"}><Languages size={16} /><b>{lang.toUpperCase()}</b><span>/</span>{lang === "it" ? "EN" : "IT"}</button>
          <button className="header-cta" onClick={() => scrollTo(generatorRef)}>{t.start}<ArrowRight size={15} /></button>
          <button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Menu" aria-expanded={menu}>{menu ? <X /> : <Menu />}</button>
        </div>
        {menu && (
          <div className="mobile-menu">
            <button onClick={() => scrollTo(generatorRef)}>{t.navCreate}</button>
            <button onClick={() => scrollTo(libraryRef)}>{t.library}</button>
            <button onClick={() => { setShowHistory(true); setMenu(false); }}>{t.history}</button>
            <button onClick={() => { setShowLearn(true); setMenu(false); }}>{t.learn}</button>
          </div>
        )}
      </header>

      <section className="hero" id="top">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span><Zap size={13} fill="currentColor" /></span>{t.heroTag}</div>
            <h1>{t.heroTitleA}<br /><em>{t.heroTitleB}</em></h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => scrollTo(generatorRef)}><WandSparkles size={18} />{t.start}<ArrowRight size={17} /></button>
              <button className="text-button" onClick={() => scrollTo(libraryRef)}>{t.explore}<ArrowRight size={16} /></button>
            </div>
            <div className="model-row"><span>{t.trusted}</span><div><b>ChatGPT</b><b>Claude</b><b>Gemini</b><b>Midjourney</b><b>Stable Diffusion</b></div></div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="visual-glow" />
            <div className="prompt-window">
              <div className="window-top"><span /><span /><span /><i>promptly / blueprint</i><ShieldCheck size={14} /></div>
              <div className="window-body">
                <div className="fake-label"><Sparkles size={13} /> PROMPT BLUEPRINT</div>
                <div className="fake-title">Launch strategy for a<br /><strong>meaningful product.</strong></div>
                <div className="fake-line wide" /><div className="fake-line mid" />
                <div className="fake-blocks"><div><span>01</span><b>Role</b><i>Strategy expert</i></div><div><span>02</span><b>Context</b><i>Market & audience</i></div></div>
                <div className="fake-blocks"><div><span>03</span><b>Constraints</b><i>Scope & metrics</i></div><div><span>04</span><b>Output</b><i>Actionable plan</i></div></div>
                <div className="fake-ready"><Check size={14} /> Role · Context · Constraints · Output</div>
              </div>
            </div>
            <div className="floating-chip chip-a"><BrainCircuit size={15} /><span>Learns from your library</span></div>
            <div className="floating-chip chip-b"><Sparkles size={15} /><span>Model-aware</span></div>
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>{fmt(stats?.total)}</strong><span>{t.statPrompts}</span></div>
          <div><strong>{fmt(stats?.categories)}</strong><span>{t.statCategories}</span></div>
          <div><strong>{fmt(stats?.generated)}</strong><span>{t.statGenerated}</span></div>
        </div>
      </section>

      <section className="generator-section" ref={generatorRef}>
        <div className="section-heading centered"><span>{t.generatorEyebrow}</span><h2>{t.generatorTitle}</h2><p>{t.generatorSub}</p></div>
        <Generator key={preset?.nonce ?? 0} lang={lang} t={t} preset={preset} onToast={notify} onGenerated={statsOnly} onOpenReference={openReference} />
      </section>

      <section className="library-section" ref={libraryRef}>
        <Library lang={lang} t={t} stats={stats} refreshKey={refreshKey} favorites={favorites} onToggleFavorite={toggleFavorite} onOpen={setOpenPrompt} onLearn={() => setShowLearn(true)} onToast={notify} onSynced={refresh} />
      </section>

      <footer>
        <div className="brand"><span className="brand-mark"><Sparkles size={18} /></span><span>promptly</span><i>lab</i></div>
        <p>{t.footer}</p>
        <div><span><ShieldCheck size={14} />{t.privacy}</span><span><Zap size={14} />{t.powered}</span><span className="credit">Made by <a href="https://alexmirici.netlify.app" target="_blank" rel="noopener noreferrer">Alex Mirici</a></span></div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile">
        <button onClick={() => scrollTo(generatorRef)}><WandSparkles size={20} /><span>{t.navCreate}</span></button>
        <button onClick={() => scrollTo(libraryRef)}><LibraryIcon size={20} /><span>{t.navExplore}</span></button>
        <button onClick={() => setShowHistory(true)}><History size={20} /><span>{t.history}</span></button>
        <button onClick={() => setShowLearn(true)}><BookOpen size={20} /><span>{t.learn}</span></button>
      </nav>

      {openPrompt && <PromptSheet prompt={openPrompt} lang={lang} t={t} onClose={closePrompt} onUse={sendToGenerator} />}
      {showHistory && <HistorySheet lang={lang} t={t} onClose={closeHistory} onToast={notify} />}
      {showLearn && <LearnModal lang={lang} t={t} onClose={closeLearn} onLearned={refresh} onToast={notify} />}
      {toast && <div className="toast" role="status"><Check size={17} />{toast}</div>}
    </main>
  );
}
