import { FIXTURES } from "@/data/fixtures";
import { espnToUpdate, fetchEspnFixtures, findEspnFixture } from "./espn";
import type { LiveMatchRef } from "./match-ref";
import type { LiveApiResponse } from "./types";

let cache: { data: LiveApiResponse; expires: number } | null = null;

function toLiveRef(f: (typeof FIXTURES)[0]): LiveMatchRef {
  return {
    id: f.id,
    home: f.home,
    away: f.away,
    date: f.date,
    result: null,
  };
}

function staticFallback(message?: string): LiveApiResponse {
  const matches = FIXTURES.map((f) => espnToUpdate(toLiveRef(f)));
  return {
    updatedAt: new Date().toISOString(),
    source: "static",
    configured: false,
    liveCount: 0,
    matches,
    error: message,
  };
}

export async function getLiveScores(): Promise<LiveApiResponse> {
  if (cache && Date.now() < cache.expires) {
    return cache.data;
  }

  try {
    const espnFixtures = await fetchEspnFixtures();
    const ourMatches = FIXTURES.map(toLiveRef);

    const updates = ourMatches.map((m) =>
      espnToUpdate(m, findEspnFixture(espnFixtures, m))
    );

    const liveCount = updates.filter(
      (u) => u.status === "live" || u.status === "halftime"
    ).length;

    const data: LiveApiResponse = {
      updatedAt: new Date().toISOString(),
      source: "espn",
      configured: true,
      liveCount,
      matches: updates,
    };

    // TTL dérivé de l'état FRAIS (l'ancien code utilisait le cache
    // précédent → un cycle de retard quand un match passait live).
    const ttl = liveCount > 0 ? 8_000 : 45_000;
    cache = { data, expires: Date.now() + ttl };
    return data;
  } catch (espnErr) {
    const message =
      espnErr instanceof Error ? espnErr.message : "Erreur ESPN";
    return staticFallback(message);
  }
}
