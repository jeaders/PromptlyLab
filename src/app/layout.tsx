import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promptly — Prompt migliori, risultati migliori",
  description: "Genera, scopri e perfeziona prompt professionali pronti all'uso per qualsiasi modello AI.",
  applicationName: "Promptly",
  keywords: ["prompt generator", "AI", "prompt engineering", "ChatGPT", "Midjourney"],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#121611" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="it"><body>{children}</body></html>;
}
