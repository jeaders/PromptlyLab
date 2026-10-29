import type { Analysis } from "./analyzer";

export type PromptItem = {
  id: number; title: string; titleEn: string; description: string; descriptionEn: string;
  content: string; contentEn: string; category: string; tags: string[]; model: string;
  featured: boolean; uses: number; source: string; lang: string; contributor: string | null; sourceUrl: string | null;
};

export type Generation = {
  id: number; goal: string; result: string; category: string; targetModel: string; mode: string;
  score: number; favorite: boolean; learned: boolean; createdAt: string;
};

export type GenerateResponse = {
  generation: Generation;
  provider: "local" | "huggingface";
  analysis: Analysis | null;
  scoreBefore: number | null;
  notes: string[];
  patternsUsed: number;
  references: Array<{ id: number; title: string; titleEn: string; source: string }>;
};

export type Stats = { curated: number; community: number; learned: number; total: number; categories: number; generated: number };

export type Preset = { nonce: number; goal: string; category: string; mode: "create" | "improve" };
