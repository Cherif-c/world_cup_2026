"use client";

import { useMemo } from "react";
import { FIXTURES } from "@/data/fixtures";
import { useLiveScores } from "@/context/LiveScoresContext";
import { useModelConfig } from "@/context/ModelContext";
import { LEGACY_MATCH_IDS } from "@/lib/live/match-ref";
import type { LiveMatchUpdate } from "@/lib/live/types";
import { enrichAll, type EnrichedMatch } from "@/lib/model/enrich";

function buildLiveMap(
  updates: LiveMatchUpdate[] | undefined
): Map<string, LiveMatchUpdate> {
  const map = new Map<string, LiveMatchUpdate>();
  if (!updates) return map;

  for (const u of updates) {
    map.set(u.matchId, u);
    const newId = Object.entries(LEGACY_MATCH_IDS).find(
      ([, legacy]) => legacy === u.matchId
    )?.[0];
    if (newId) map.set(newId, u);
  }
  return map;
}

export function useEnrichedMatches(filter?: {
  matchday?: 1 | 2 | 3;
  group?: string;
}): EnrichedMatch[] {
  const { config } = useModelConfig();
  const { data } = useLiveScores();

  return useMemo(() => {
    let fixtures = FIXTURES;
    if (filter?.matchday) {
      fixtures = fixtures.filter((f) => f.matchday === filter.matchday);
    }
    if (filter?.group) {
      fixtures = fixtures.filter((f) => f.group === filter.group);
    }
    return enrichAll(fixtures, config, buildLiveMap(data?.matches));
  }, [config, data?.matches, filter?.matchday, filter?.group]);
}
