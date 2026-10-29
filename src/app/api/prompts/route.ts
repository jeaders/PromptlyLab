import { db } from "@/db";
import { prompts } from "@/db/schema";
import { analyzePrompt } from "@/lib/analyzer";
import { isCategory } from "@/lib/catalog";
import { ensureLibrary } from "@/lib/library";
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export async function GET(request: Request) {
  try {
    await ensureLibrary();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const source = searchParams.get("source");
    const query = searchParams.get("q")?.trim().slice(0, 100);
    const page = Math.max(1, Math.min(500, Number(searchParams.get("page")) || 1));
    const idsParam = searchParams.get("ids");

    const filters: SQL[] = [];
    if (idsParam) {
      const ids = idsParam.split(",").map(Number).filter(Number.isInteger).slice(0, 100);
      filters.push(ids.length ? sql`${prompts.id} in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})` : sql`false`);
    }
    if (isCategory(category)) filters.push(eq(prompts.category, category));
    if (source === "curated" || source === "community" || source === "learned") filters.push(eq(prompts.source, source));
    if (query) {
      const like = `%${query}%`;
      filters.push(or(ilike(prompts.title, like), ilike(prompts.titleEn, like), ilike(prompts.description, like), ilike(prompts.descriptionEn, like), sql`${prompts.tags}::text ilike ${like}`)!);
    }
    const where = filters.length ? and(...filters) : undefined;

    const [items, [{ total }]] = await Promise.all([
      db.select().from(prompts).where(where)
        .orderBy(desc(prompts.featured), sql`case ${prompts.source} when 'learned' then 0 when 'curated' then 1 else 2 end`, desc(prompts.uses), asc(prompts.id))
        .limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
      db.select({ total: sql<number>`count(*)::int` }).from(prompts).where(where),
    ]);
    return Response.json({ items, total, page, hasMore: page * PAGE_SIZE < total });
  } catch (error) {
    console.error("prompts:get", error);
    return Response.json({ error: "Unable to load prompt library" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: unknown; content?: unknown; category?: unknown; language?: unknown };
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";
    const content = typeof body.content === "string" ? body.content.trim().slice(0, 8000) : "";
    if (!title || content.length < 30) return Response.json({ error: "Title and a prompt of at least 30 characters are required" }, { status: 400 });

    const lang = body.language === "en" ? "en" : "it";
    const analysis = analyzePrompt(content);
    const [item] = await db.insert(prompts).values({
      title, titleEn: title,
      description: `Prompt appreso dal tuo workspace · qualità ${analysis.score}/100`,
      descriptionEn: `Prompt learned from your workspace · quality ${analysis.score}/100`,
      content, contentEn: content,
      category: isCategory(body.category) ? body.category : "Altro",
      tags: ["learned"], model: "Custom", source: "learned", lang,
    }).returning();
    return Response.json({ item, analysis }, { status: 201 });
  } catch (error) {
    console.error("prompts:post", error);
    return Response.json({ error: "Unable to learn prompt" }, { status: 500 });
  }
}
