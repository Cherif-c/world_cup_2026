import { fetchMatchDetail, fetchMatchPitchData } from "@/lib/live/espn-summary";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const summaryCache = new Map<string, { data: unknown; expires: number }>();
const pitchCache = new Map<string, { data: unknown; expires: number }>();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const pitchOnly = new URL(req.url).searchParams.get("pitch") === "1";

  if (pitchOnly) {
    const hit = pitchCache.get(matchId);
    if (hit && Date.now() < hit.expires) {
      return NextResponse.json(hit.data, {
        headers: { "Cache-Control": "no-store" },
      });
    }
    try {
      const pitch = await fetchMatchPitchData(matchId);
      pitchCache.set(matchId, {
        data: pitch,
        expires: Date.now() + 90_000,
      });
      return NextResponse.json(pitch);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur terrain";
      return NextResponse.json({ error: message }, { status: 404 });
    }
  }

  const hit = summaryCache.get(matchId);
  if (hit && Date.now() < hit.expires) {
    return NextResponse.json(hit.data, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const detail = await fetchMatchDetail(matchId, { includePitch: false });
    const ttl =
      detail.status === "live" || detail.status === "halftime"
        ? 12_000
        : detail.status === "finished"
          ? 120_000
          : 60_000;
    summaryCache.set(matchId, { data: detail, expires: Date.now() + ttl });

    return NextResponse.json(detail, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur match";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
