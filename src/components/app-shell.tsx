"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight, BookOpen, Check, History as HistoryIcon, Home, Languages, LibraryBig,
  Sparkles, WandSparkles, Zap, ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { useApp } from "./app-provider";

const primaryNav = [
  { href: "/create", icon: WandSparkles, key: "create" as const },
  { href: "/library", icon: LibraryBig, key: "library" as const },
  { href: "/history", icon: HistoryIcon, key: "history" as const },
  { href: "/learn", icon: BookOpen, key: "learn" as const },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { lang, t, toggleLang, toast } = useApp();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const labels: Record<(typeof primaryNav)[number]["key"], string> = {
    create: t.navCreate,
    library: t.library,
    history: t.history,
    learn: t.learn,
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#content">{t.skipToContent}</a>

      <header className="topbar">
        <Link className="brand" href="/" aria-label="Promptly home">
          <span className="brand-mark"><Sparkles size={18} /></span>
          <span>promptly</span><i>lab</i>
        </Link>

        <nav className="desktop-nav" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""} aria-current={isActive(item.href) ? "page" : undefined}>
              {labels[item.key]}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="language-switch" onClick={toggleLang} aria-label={lang === "it" ? "Switch to English" : "Passa all'italiano"}>
            <Languages size={15} /><b>{lang.toUpperCase()}</b><span>/</span>{lang === "it" ? "EN" : "IT"}
          </button>
          <Link className="header-cta" href="/create">{t.start}<ArrowRight size={15} /></Link>
        </div>
      </header>

      <main className="app-main" id="content">{children}</main>

      <footer>
        <div className="footer-brand">
          <Link className="brand" href="/"><span className="brand-mark"><Sparkles size={18} /></span><span>promptly</span><i>lab</i></Link>
          <p>{t.footer}</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {primaryNav.map((item) => <Link key={item.href} href={item.href}>{labels[item.key]}</Link>)}
        </nav>
        <div className="footer-notes">
          <span><ShieldCheck size={14} />{t.privacy}</span>
          <span><Zap size={14} />{t.powered}</span>
          <span className="credit">Made by <a href="https://alexmirici.netlify.app" target="_blank" rel="noopener noreferrer">Alex Mirici</a></span>
        </div>
      </footer>

      <nav className="mobile-bottom-nav" aria-label="Mobile">
        <Link href="/" className={isActive("/") ? "active" : ""} aria-current={isActive("/") ? "page" : undefined}>
          <Home size={20} /><span>{t.navHome}</span>
        </Link>
        <Link href="/create" className={isActive("/create") ? "active" : ""} aria-current={isActive("/create") ? "page" : undefined}>
          <WandSparkles size={21} /><span>{t.navCreate}</span>
        </Link>
        <Link href="/library" className={isActive("/library") ? "active" : ""} aria-current={isActive("/library") ? "page" : undefined}>
          <LibraryBig size={20} /><span>{t.library}</span>
        </Link>
        <Link href="/history" className={isActive("/history") ? "active" : ""} aria-current={isActive("/history") ? "page" : undefined}>
          <HistoryIcon size={20} /><span>{t.history}</span>
        </Link>
        <Link href="/learn" className={isActive("/learn") ? "active" : ""} aria-current={isActive("/learn") ? "page" : undefined}>
          <BookOpen size={20} /><span>{t.learn}</span>
        </Link>
      </nav>

      {toast && <div className="toast" role="status" aria-live="polite"><Check size={17} />{toast}</div>}
    </div>
  );
}
