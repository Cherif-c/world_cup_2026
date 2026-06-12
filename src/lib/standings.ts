import { GROUPS, GROUP_IDS } from "@/data/groups";
import type { EnrichedMatch } from "@/lib/model/enrich";
import { resultForVerdict } from "@/lib/live/merge";

export interface TeamStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  /** Points réels + espérance modèle sur matchs restants de la poule */
  projectedPoints: number;
  rank: number;
}

export interface GroupStandings {
  group: string;
  teams: TeamStanding[];
}

function emptyRow(team: string): Omit<TeamStanding, "rank" | "projectedPoints"> & {
  projectedPoints: number;
} {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
    projectedPoints: 0,
  };
}

function applyResult(
  rows: Map<string, ReturnType<typeof emptyRow>>,
  home: string,
  away: string,
  score: string
) {
  const [h, a] = score.split("-").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(a)) return;

  const rh = rows.get(home)!;
  const ra = rows.get(away)!;

  rh.played++;
  ra.played++;
  rh.gf += h;
  rh.ga += a;
  ra.gf += a;
  ra.ga += h;

  if (h > a) {
    rh.won++;
    rh.points += 3;
    ra.lost++;
  } else if (h < a) {
    ra.won++;
    ra.points += 3;
    rh.lost++;
  } else {
    rh.drawn++;
    ra.drawn++;
    rh.points++;
    ra.points++;
  }
}

function expectedPoints(pred: [number, number, number], isHome: boolean): number {
  const [pHome, pDraw, pAway] = pred.map((p) => p / 100);
  if (isHome) return pHome * 3 + pDraw * 1;
  return pAway * 3 + pDraw * 1;
}

function sortStandings(
  teams: (Omit<TeamStanding, "rank"> & { projectedPoints: number })[]
): TeamStanding[] {
  const sorted = [...teams].sort((a, b) => {
    if (b.projectedPoints !== a.projectedPoints)
      return b.projectedPoints - a.projectedPoints;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team, "fr");
  });

  return sorted.map((t, i) => ({
    ...t,
    gd: t.gf - t.ga,
    rank: i + 1,
  }));
}

export function computeGroupStandings(
  group: string,
  matches: EnrichedMatch[]
): GroupStandings {
  const teams = GROUPS[group];
  const rows = new Map(teams.map((t) => [t, emptyRow(t)]));

  for (const m of matches.filter((x) => x.group === group)) {
    const result = resultForVerdict({ ...m, result: m.result ?? null }, m.live);
    if (result) {
      applyResult(rows, m.home, m.away, result);
    }
  }

  for (const m of matches.filter((x) => x.group === group)) {
    const result = resultForVerdict({ ...m, result: m.result ?? null }, m.live);
    if (result) continue;

    const rh = rows.get(m.home)!;
    const ra = rows.get(m.away)!;
    rh.projectedPoints += expectedPoints(m.pred, true);
    ra.projectedPoints += expectedPoints(m.pred, false);
  }

  const withProjected = [...rows.values()].map((r) => ({
    ...r,
    gd: r.gf - r.ga,
    projectedPoints: Math.round((r.points + r.projectedPoints) * 10) / 10,
  }));

  return {
    group,
    teams: sortStandings(withProjected),
  };
}

export function computeAllStandings(
  matches: EnrichedMatch[]
): GroupStandings[] {
  return GROUP_IDS.map((g) => computeGroupStandings(g, matches));
}
