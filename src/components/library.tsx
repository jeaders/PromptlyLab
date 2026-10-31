"use client";

import { ArrowRight, BrainCircuit, Clipboard, Check, Download, Heart, LoaderCircle, Plus, Search, Sparkles, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES, CATEGORY_LABELS, isCategory, type Language } from "@/lib/catalog";
import type { Dict } from "@/lib/i18n";
import type { PromptItem, Stats } from "@/lib/types";
import { catClass, categoryIcons, copyToClipboard } from "./ui";

type Source = "all" | "curated" | "community" | "learned" | "favorites";

type Props = {
  lang: Language; t: Dict; stats: Stats | null; refreshKey: number; favorites: number[];
  onToggleFavorite: (id: number) => void; onOpen: (p: PromptItem) => void; onLearn: () => void;
  onToast: (msg: string) => void; onSynced: () => void;
};

export default function Library({ lang, t, stats, refreshKey, favorites, onToggleFavorite, onOpen, onLearn, onToast, onSynced }: Props) {
  const [category, setCategory] = useState("Tutti");
  const [source, setSource] = useState<Source>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PromptItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const favKey = source === "favorites" ? favorites.join(",") : "";

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page) });
        if (category !== "Tutti") params.set("category", category);
        if (query) params.set("q", query);
        if (source === "favorites") params.set("ids", favKey || "0");
        else if (source !== "all") params.set("source", source);
        const r = await fetch(`/api/prompts?${params}`, { signal: controller.signal });
        if (!r.ok) throw new Error();
        const data = (await r.json()) as { items: PromptItem[]; total: number; hasMore: boolean };
        setItems((cur) => (page === 1 ? data.items : [...cur, ...data.items.filter((n) => !cur.some((c) => c.id === n.id))]));
        setTotal(data.total);
        setHasMore(data.hasMore);
      } catch {
        if (controller.signal.aborted) return;
        onToast(t.error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [category, source, query, page, favKey, refreshKey, onToast, t.error]);

  // Any filter change restarts from the first page.
  function changeFilter(fn: () => void) { fn(); setPage(1); }

  async function syncNow() {
    setSyncing(true);
    try {
      const r = await fetch("/api/library/sync", { method: "POST" });
      if (!r.ok) throw new Error();
      onToast(t.synced);
      onSynced();
      setPage(1);
    } catch { onToast(t.error); } finally { setSyncing(false); }
  }

  async function quickCopy(p: PromptItem) {
    if (await copyToClipboard(lang === "it" ? p.content : p.contentEn)) {
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 1500);
      void fetch(`/api/prompts/${p.id}`, { method: "PATCH" });
    }
  }

  const sources: Array<{ id: Source; label: string; count?: number }> = [
    { id: "all", label: t.sourceAll, count: stats?.total },
    { id: "curated", label: t.sourceCurated, count: stats?.curated },
    { id: "community", label: t.sourceCommunity, count: stats?.community },
    { id: "learned", label: t.sourceLearned, count: stats?.learned },
    { id: "favorites", label: t.favorites, count: favorites.length },
  ];

  return (
    <>
      <div className="library-top">
        <div className="section-heading"><span>{t.library}</span><h2>{t.libraryTitle}</h2><p>{t.libraryText}</p></div>
        <button className="learn-button" onClick={onLearn}><Plus size={17} />{t.learn}</button>
      </div>

      {stats && stats.community === 0 && (
        <div className="sync-banner">
          <Users size={18} /><span>{t.syncing}</span>
          <button onClick={syncNow} disabled={syncing}>{syncing ? <LoaderCircle className="spin" size={14} /> : <Download size={14} />}{t.syncNow}</button>
        </div>
      )}

      <div className="library-tools">
        <div className="search-box">
          <Search size={18} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t.search} aria-label={t.search} />
          {search && <button onClick={() => changeFilter(() => setSearch(""))} aria-label="Clear"><X size={15} /></button>}
        </div>
        <div className="source-tabs">
          {sources.map((s) => (
            <button key={s.id} className={source === s.id ? "active" : ""} onClick={() => changeFilter(() => setSource(s.id))}>
              {s.id === "favorites" && <Heart size={12} />}{s.id === "learned" && <BrainCircuit size={12} />}{s.label}{typeof s.count === "number" && <small>{s.count}</small>}
            </button>
          ))}
        </div>
        <div className="category-scroll">
          {(["Tutti", ...CATEGORIES] as const).map((cat) => {
            const Icon = categoryIcons[cat] ?? Sparkles;
            return <button key={cat} className={category === cat ? "active" : ""} onClick={() => changeFilter(() => setCategory(cat))}><Icon size={15} />{CATEGORY_LABELS[cat][lang]}</button>;
          })}
        </div>
      </div>

      <div className="result-count"><b>{total.toLocaleString(lang)}</b> {t.prompts}</div>

      {loading && page === 1 ? (
        <div className="loading-grid">{[1, 2, 3, 4, 5, 6, 7, 8].map((x) => <div className="skeleton-card" key={x} />)}</div>
      ) : items.length ? (
        <div className="prompt-grid">
          {items.map((p) => {
            const Icon = categoryIcons[p.category] ?? Sparkles;
            const fav = favorites.includes(p.id);
            return (
              <article className="prompt-card" key={p.id}>
                <div className="card-top">
                  <span className={`category-icon ${catClass(p.category)}`}><Icon size={18} /></span>
                  <div className="card-badges">
                    {p.source === "learned" && <span className="learned-badge"><BrainCircuit size={11} />{t.sourceLearned}</span>}
                    {p.source === "community" && <span className="community-badge"><Users size={11} />{t.sourceCommunity}</span>}
                    {p.lang === "en" && lang === "it" && <span className="lang-badge">{t.englishOnly}</span>}
                    <button onClick={() => onToggleFavorite(p.id)} aria-label={t.favorites} aria-pressed={fav} className={fav ? "fav" : ""}><Heart size={17} fill={fav ? "currentColor" : "none"} /></button>
                  </div>
                </div>
                <span className="category-name">{isCategory(p.category) ? CATEGORY_LABELS[p.category][lang] : p.category}</span>
                <h3><button className="title-button" onClick={() => onOpen(p)}>{lang === "it" ? p.title : p.titleEn}</button></h3>
                <p>{lang === "it" ? p.description : p.descriptionEn}</p>
                <div className="tags">{p.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
                <div className="card-footer">
                  <span>{p.model}</span>
                  <div>
                    <button onClick={() => quickCopy(p)} aria-label={t.copy}>{copiedId === p.id ? <Check size={16} /> : <Clipboard size={16} />}</button>
                    <button className="use-button" onClick={() => onOpen(p)}>{t.usePrompt}<ArrowRight size={14} /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={26} /><h3>{t.noResults}</h3><p>{t.noResultsText}</p>
          <button onClick={() => changeFilter(() => { setSearch(""); setCategory("Tutti"); setSource("all"); })}>{t.reset}</button>
        </div>
      )}

      {hasMore && items.length > 0 && (
        <div className="load-more"><button onClick={() => setPage((p) => p + 1)} disabled={loading}>{loading ? <LoaderCircle className="spin" size={16} /> : null}{t.loadMore}</button></div>
      )}
    </>
  );
}
