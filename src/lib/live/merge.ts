import type { FlatMatch } from "@/data/matches";
import { brierScore, getVerdict, type Verdict } from "@/lib/scoring";
import type { LiveMatchUpdate } from "./types";

export function displayScore(
  match: FlatMatch,
  live?: LiveMatchUpdate
): string | null {
  if (!live) return match.result;
  if (live.scoreText && live.status !== "scheduled") return live.scoreText;
  return match.result;
}

export function resultForVerdict(
  match: FlatMatch,
  live?: LiveMatchUpdate
): string | null {
  if (live?.status === "finished" && live.scoreText) return live.scoreText;
  if (!live && match.result) return match.result;
  return null;
}

export function liveVerdict(
  match: FlatMatch,
  live?: LiveMatchUpdate
): Verdict | "live" | "halftime" | null {
  if (live?.status === "live") return "live";
  if (live?.status === "halftime") return "halftime";
  const result = resultForVerdict(match, live);
  if (!result) return null;
  return getVerdict(match.predictedScore, result);
}

export function liveBrier(
  match: FlatMatch,
  live?: LiveMatchUpdate
): number | null {
  const result = resultForVerdict(match, live);
  if (!result) return null;
  return brierScore(match.pred, result);
}

export function computeLiveStats(
  matches: FlatMatch[],
  updates: Map<string, LiveMatchUpdate>
) {
  let exact = 0;
  let vainqueur = 0;
  let rate = 0;
  let upcoming = 0;
  let brierSum = 0;
  let played = 0;
  let live = 0;

  for (const m of matches) {
    const u = updates.get(m.id);
    if (u?.status === "live" || u?.status === "halftime") {
      live++;
      continue;
    }
    const result = resultForVerdict(m, u);
    if (!result) {
      upcoming++;
      continue;
    }
    played++;
    const v = getVerdict(m.predictedScore, result);
    if (v === "exact") exact++;
    else if (v === "vainqueur") vainqueur++;
    else rate++;
    brierSum += brierScore(m.pred, result);
  }

  return {
    exact,
    vainqueur,
    rate,
    upcoming,
    live,
    avgBrier: played > 0 ? brierSum / played : null,
    played,
    accuracy:
      played > 0 ? Math.round(((exact + vainqueur) / played) * 100) : null,
  };
}
