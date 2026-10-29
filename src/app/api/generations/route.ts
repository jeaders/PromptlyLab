import { db } from "@/db";
import { generations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const favorites = new URL(request.url).searchParams.get("favorites") === "1";
    const items = await db.select().from(generations)
      .where(favorites ? eq(generations.favorite, true) : undefined)
      .orderBy(desc(generations.createdAt)).limit(40);
    return Response.json({ items });
  } catch (error) {
    console.error("generations:get", error);
    return Response.json({ error: "Unable to load history" }, { status: 500 });
  }
}
