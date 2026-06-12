import type { Fixture } from "@/data/fixtures";
import type { LiveMatchUpdate } from "@/lib/live/types";
import { resultForVerdict } from "@/lib/live/merge";

export interface EloTimeline {
  /** Elo à utiliser pour pricer ce match (état pré-match si terminé) */
  beforeMatch: Map<string, Record<string, number>>;
  /** Elo après tous les matchs terminés — pour les matchs à venir */
  current: Record<string, number>;
}

function applyEloResult(
  elo: Record<string, number>,
  home: string,
  away: string,
  score: string,
  k: number
) {
  const [hg, ag] = score.split("-").map(Number);
  if (Number.isNaN(hg) || Number.isNaN(ag)) return;

  const eloHome = elo[home] ?? 1700;
  const eloAway = elo[away] ?? 1700;
  const diff = eloHome - eloAway;
  const expected = 1 / (1 + Math.pow(10, -diff / 400));

  let actual: number;
  if (hg > ag) actual = 1;
  else if (hg === ag) actual = 0.5;
  else actual = 0;

  const gd = Math.abs(hg - ag);
  const movMult = gd === 0 ? 1 : 1 + Math.log1p(gd) * (2.2 / (2.2 + gd));

  const delta = k * movMult * (actual - expected);
  elo[home] = Math.round(eloHome + delta);
  elo[away] = Math.round(eloAway - delta);
}

function matchSortKey(f: Fixture): string {
  return `${f.date}T${f.kickoff}`;
}

/** K dérivé de eloPerGd — norme eloratings.net : K = 60 en finale de CDM.
 *  8000 / 137 ≈ 58, borné [40, 70]. (L'ancien 4000/x ≈ 29 sous-réagissait.) */
export function eloK(eloPerGd: number): number {
  return Math.max(40, Math.min(70, Math.round(8000 / eloPerGd)));
}

export function buildEloTimeline(
  baseElo: Record<string, number>,
  fixtures: Fixture[],
  liveMap: Map<string, LiveMatchUpdate>,
  eloPerGd: number
): EloTimeline {
  const elo = { ...baseElo };
  const beforeMatch = new Map<string, Record<string, number>>();
  const k = eloK(eloPerGd);

  const finished = fixtures
    .filter((f) => {
      const live = liveMap.get(f.id);
      return !!resultForVerdict({ ...f, result: f.result ?? null }, live);
    })
    .sort((a, b) => matchSortKey(a).localeCompare(matchSortKey(b)));

  for (const f of finished) {
    beforeMatch.set(f.id, { ...elo });
    const live = liveMap.get(f.id);
    const score = resultForVerdict({ ...f, result: f.result ?? null }, live)!;
    applyEloResult(elo, f.home, f.away, score, k);
  }

  return { beforeMatch, current: elo };
}
