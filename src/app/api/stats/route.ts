import { db } from "@/db";
import { generations } from "@/db/schema";
import { ensureLibrary, libraryStats } from "@/lib/library";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureLibrary();
    const [library, [{ generated }]] = await Promise.all([
      libraryStats(),
      db.select({ generated: sql<number>`count(*)::int` }).from(generations),
    ]);
    return Response.json({ ...library, generated });
  } catch (error) {
    console.error("stats:get", error);
    return Response.json({ error: "Unable to load stats" }, { status: 500 });
  }
}
