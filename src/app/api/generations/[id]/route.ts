import { db } from "@/db";
import { generations } from "@/db/schema";
import { eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

async function parseId(context: Ctx) {
  const id = Number((await context.params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: Ctx) {
  const id = await parseId(context);
  if (!id) return Response.json({ error: "Invalid id" }, { status: 400 });
  let body: { favorite?: unknown; learned?: unknown };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const update: { favorite?: boolean; learned?: boolean } = {};
  if (typeof body.favorite === "boolean") update.favorite = body.favorite;
  if (typeof body.learned === "boolean") update.learned = body.learned;
  if (!Object.keys(update).length) return Response.json({ error: "Nothing to update" }, { status: 400 });
  const [item] = await db.update(generations).set(update).where(eq(generations.id, id)).returning();
  return item ? Response.json({ item }) : Response.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_: Request, context: Ctx) {
  const id = await parseId(context);
  if (!id) return Response.json({ error: "Invalid id" }, { status: 400 });
  const [item] = await db.delete(generations).where(eq(generations.id, id)).returning({ id: generations.id });
  return item ? Response.json({ ok: true }) : Response.json({ error: "Not found" }, { status: 404 });
}
