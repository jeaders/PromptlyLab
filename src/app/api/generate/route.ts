import { db } from "@/db";
import { generations } from "@/db/schema";
import { analyzePrompt } from "@/lib/analyzer";
import { ASPECT_RATIOS, TECHNIQUES, isCategory, isImageModel, isTargetModel, type AspectRatio, type Technique } from "@/lib/catalog";
import { buildPrompt, enhanceWithHuggingFace, type GenerateInput } from "@/lib/generator";
import { findSimilar, minePatterns } from "@/lib/library";

export const dynamic = "force-dynamic";

type Body = Partial<Omit<GenerateInput, "techniques">> & { techniques?: unknown };

export async function POST(request: Request) {
  let body: Body;
  try { body = (await request.json()) as Body; } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }

  const goal = typeof body.goal === "string" ? body.goal.trim() : "";
  if (goal.length < 8 || goal.length > 6000) return Response.json({ error: "Describe your goal in 8–6000 characters" }, { status: 400 });

  const input: GenerateInput = {
    goal,
    category: isCategory(body.category) ? body.category : "Altro",
    tone: typeof body.tone === "string" ? body.tone.slice(0, 40) : "Professionale",
    language: body.language === "en" ? "en" : "it",
    detailLevel: body.detailLevel === "concise" || body.detailLevel === "deep" ? body.detailLevel : "balanced",
    context: typeof body.context === "string" ? body.context.slice(0, 3000) : undefined,
    audience: typeof body.audience === "string" ? body.audience.slice(0, 300) : undefined,
    outputFormat: typeof body.outputFormat === "string" ? body.outputFormat.slice(0, 1000) : undefined,
    targetModel: isTargetModel(body.targetModel) ? body.targetModel : "universal",
    techniques: Array.isArray(body.techniques) ? body.techniques.filter((t): t is Technique => TECHNIQUES.some((x) => x.id === t)) : [],
    aspectRatio: (ASPECT_RATIOS as readonly string[]).includes(body.aspectRatio ?? "") ? (body.aspectRatio as AspectRatio) : "16:9",
    mode: body.mode === "improve" ? "improve" : "create",
  };

  try {
    const imageCreate = isImageModel(input.targetModel) && input.mode === "create";
    const references = imageCreate ? [] : await findSimilar(goal, input.category, 3);
    const patterns = minePatterns(references, input.language);
    const draft = buildPrompt(input, patterns);
    const { result, provider } = await enhanceWithHuggingFace(input, draft.result);
    const analysis = imageCreate ? null : analyzePrompt(result);
    const scoreBefore = input.mode === "improve" ? analyzePrompt(goal).score : null;

    const [saved] = await db.insert(generations).values({
      goal, result, category: input.category, tone: input.tone, language: input.language,
      detailLevel: input.detailLevel, targetModel: input.targetModel, mode: input.mode, score: analysis?.score ?? 0,
    }).returning();

    return Response.json({
      generation: saved,
      provider,
      analysis,
      scoreBefore,
      notes: draft.notes,
      patternsUsed: patterns.length,
      references: references.map((r) => ({ id: r.id, title: r.title, titleEn: r.titleEn, source: r.source })),
    });
  } catch (error) {
    console.error("generate:post", error);
    return Response.json({ error: "Generation failed" }, { status: 500 });
  }
}
