import { syncCommunity } from "@/lib/library";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Idempotent import of the CC0 community dataset (only missing titles are added). */
export async function POST() {
  try {
    const result = await syncCommunity();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("library:sync", error);
    return Response.json({ ok: false, error: "Sync failed" }, { status: 502 });
  }
}
