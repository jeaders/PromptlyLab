import PromptForgeApp from "@/components/prompt-forge-app";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <a href="#top" className="skip-link">
        Vai al contenuto principale
      </a>
      <PromptForgeApp />
    </>
  );
}
