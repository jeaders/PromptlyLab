import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const promptId = Number(id);
  if (!Number.isInteger(promptId)) return Response.json({ error: "Invalid id" }, { status: 400 });
  const [item] = await db.update(prompts).set({ uses: sql`${prompts.uses} + 1` }).where(eq(prompts.id, promptId)).returning();
  return item ? Response.json({ item }) : Response.json({ error: "Not found" }, { status: 404 });
}
