"use client";

import {
  AudioLines, BarChart3, Briefcase, Clapperboard, Code2, Dices, GraduationCap, Heart, Image as ImageIcon,
  Megaphone, Palette, PenLine, Rocket, Search, Sparkles, UserRound, type LucideIcon,
} from "lucide-react";

export const categoryIcons: Record<string, LucideIcon> = {
  Tutti: Sparkles, Marketing: Megaphone, Scrittura: PenLine, Immagini: ImageIcon, Video: Clapperboard, Audio: AudioLines,
  Sviluppo: Code2, Dati: BarChart3, Design: Palette, Business: Briefcase, Ricerca: Search, Studio: GraduationCap,
  Produttività: Rocket, Carriera: UserRound, Lifestyle: Heart, Giochi: Dices, Altro: Sparkles,
};

export function catClass(category: string) {
  return `cat-${category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
}

export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function scoreTone(score: number) {
  return score >= 80 ? "great" : score >= 55 ? "good" : "weak";
}

export function ScoreRing({ score, size = 52 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={`score-ring ${scoreTone(score)}`} style={{ width: size, height: size }} aria-label={`${score}/100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="track" />
        <circle cx={size / 2} cy={size / 2} r={r} className="value" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
      </svg>
      <b>{score}</b>
    </span>
  );
}

export const OPEN_IN = [
  { id: "chatgpt", label: "ChatGPT", url: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}` },
  { id: "claude", label: "Claude", url: (q: string) => `https://claude.ai/new?q=${encodeURIComponent(q)}` },
  { id: "perplexity", label: "Perplexity", url: (q: string) => `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}` },
] as const;

/** Highlights [PLACEHOLDER] tokens inside a prompt. */
export function HighlightedPrompt({ text }: { text: string }) {
  const parts = text.split(/(\[[^\[\]\n]{2,40}\])/g);
  return <>{parts.map((p, i) => (/^\[[^\[\]\n]{2,40}\]$/.test(p) ? <mark key={i}>{p}</mark> : <span key={i}>{p}</span>))}</>;
}
