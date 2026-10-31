"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Language } from "@/lib/catalog";
import { dictionaries, type Dict } from "@/lib/i18n";
import type { Stats } from "@/lib/types";

const LANG_KEY = "promptly:lang";
const FAV_KEY = "promptly:favorites";
export const PRESET_KEY = "promptly:preset";

type AppContextValue = {
  lang: Language;
  t: Dict;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  stats: Stats | null;
  refreshStats: () => void;
  favorites: number[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number) => void;
  toast: string;
  notify: (message: string) => void;
  openInGenerator: (text: string, category: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "it" || saved === "en") return saved;
    } catch { /* storage unavailable */ }
    return "it";
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]") as unknown;
      if (Array.isArray(saved)) {
        return saved.filter((x): x is number => Number.isInteger(x));
      }
    } catch { /* storage unavailable */ }
    return [];
  });
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const refreshStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) setStats((await response.json()) as Stats);
    } catch { /* stats are non-critical */ }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) setStats((await response.json()) as Stats);
      } catch { /* stats are non-critical */ }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);

  const toggleLang = useCallback(() => setLang((current) => (current === "it" ? "en" : "it")), []);

  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const openInGenerator = useCallback((text: string, category: string) => {
    try {
      sessionStorage.setItem(PRESET_KEY, JSON.stringify({ nonce: Date.now(), goal: text, category, mode: "improve" }));
    } catch { /* storage unavailable */ }
    router.push("/create");
  }, [router]);

  const value = useMemo<AppContextValue>(() => ({
    lang,
    t: dictionaries[lang],
    setLang,
    toggleLang,
    stats,
    refreshStats,
    favorites,
    isFavorite,
    toggleFavorite,
    toast,
    notify,
    openInGenerator,
  }), [lang, toggleLang, stats, refreshStats, favorites, isFavorite, toggleFavorite, toast, notify, openInGenerator]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
