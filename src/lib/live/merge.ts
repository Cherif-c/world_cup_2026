import { brierScore, getVerdict, getVerdict1x2, type Verdict } from "@/lib/scoring";
import type { LiveMatchRef } from "./match-ref";
import type { LiveMatchUpdate } from "./types";

export interface ScoredMatch extends LiveMatchRef {
  pred: [number, number, number];
  predictedScore: string;
}

export function displayScore(
  match: LiveMatchRef,
  live?: LiveMatchUpdate
): string | null {
  if (!live) return match.result ?? null;
  if (live.scoreText && live.status !== "scheduled") return live.scoreText;
  return match.result ?? null;
}

export function resultForVerdict(
  match: LiveMatchRef,
  live?: LiveMatchUpdate
): string | null {
  if (live?.status === "finished" && live.scoreText) return live.scoreText;
  if (!live && match.result) return match.result;
  return null;
}

export function liveVerdict(
  match: ScoredMatch,
  live?: LiveMatchUpdate
): Verdict | "live" | "halftime" | null {
  if (live?.status === "live") return "live";
  if (live?.status === "halftime") return "halftime";
  const result = resultForVerdict(match, live);
  if (!result) return null;
  return getVerdict(match.predictedScore, result);
}

export function liveVerdict1x2(
  match: ScoredMatch,
  live?: LiveMatchUpdate
): Verdict | "live" | "halftime" | null {
  if (live?.status === "live") return "live";
  if (live?.status === "halftime") return "halftime";
  const result = resultForVerdict(match, live);
  if (!result) return null;
  return getVerdict1x2(match.pred, result);
}

export function liveBrier(
  match: ScoredMatch,
  live?: LiveMatchUpdate
): number | null {
  const result = resultForVerdict(match, live);
  if (!result) return null;
  return brierScore(match.pred, result);
}
