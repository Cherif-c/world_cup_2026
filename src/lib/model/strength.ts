import {
  defaultStrengthFor,
  type StrengthAdj,
} from "@/data/team-strength";
import type { GlobalParams, MatchAdjustments } from "./types";

const ELO_BASE = 1700;
const ELO_SCALE = 400;

function eloFactor(elo: number): number {
  return (elo - ELO_BASE) / ELO_SCALE;
}

export function attackPower(
  team: string,
  elo: number,
  strength: Record<string, StrengthAdj>
): number {
  const adj = strength[team] ?? defaultStrengthFor(team);
  return eloFactor(elo) + adj.attack;
}

export function defensePower(
  team: string,
  elo: number,
  strength: Record<string, StrengthAdj>
): number {
  const adj = strength[team] ?? defaultStrengthFor(team);
  return eloFactor(elo) + adj.defense;
}

/** Boost log pour l'avantage domicile / contexte (points Elo → ~12 % max) */
function homeLogBoost(adjEloA: number): number {
  return Math.min(0.18, Math.max(0, adjEloA / 400) * 0.9);
}

/**
 * Intensités Poisson via attaque vs défense (modèle Maher).
 * Sépare capacité offensive et solidité défensive — permet 4-0 vs faibles
 * et 1-0 serrés entre équipes proches.
 */
export function intensitesFromStrength(
  teamA: string,
  teamB: string,
  eloA: number,
  eloB: number,
  strength: Record<string, StrengthAdj>,
  adj: MatchAdjustments,
  params: GlobalParams,
  muTotal: number
): [number, number] {
  const attA = attackPower(teamA, eloA, strength);
  const attB = attackPower(teamB, eloB, strength);
  const defA = defensePower(teamA, eloA, strength);
  const defB = defensePower(teamB, eloB, strength);
  const homeBoost = homeLogBoost(adj.adjEloA);

  let rawA = Math.exp(attA - defB + homeBoost);
  let rawB = Math.exp(attB - defA);

  if (defB > 0.35) {
    rawA *= Math.max(0.42, Math.exp(-(defB - 0.35) * 1.35));
  }
  if (defA > 0.35) {
    rawB *= Math.max(0.38, Math.exp(-(defA - 0.35) * 1.35));
  }

  rawA = Math.max(params.lambdaMin * 0.5, rawA);
  rawB = Math.max(params.lambdaMin * 0.5, rawB);

  const eloDiff = eloA + adj.adjEloA - (eloB + adj.adjEloB);
  const weakDefense = eloDiff >= 0 ? defB : defA;
  const gap = Math.abs(eloDiff);
  const mismatchFactor =
    gap >= 100 && weakDefense < 0.15
      ? 1 + (gap - 100) / 360
      : 1;

  let effectiveMu = muTotal * mismatchFactor;

  const defClash = Math.min(defA, defB);
  if (defClash > 0.35) {
    effectiveMu *= 1 - 0.14 * Math.min(1, (defClash - 0.35) / 0.55);
  }

  const sum = rawA + rawB;
  let la = (effectiveMu * rawA) / sum + adj.bonusLambdaA;
  let lb = (effectiveMu * rawB) / sum + adj.bonusLambdaB;

  la = Math.max(params.lambdaMin, la);
  lb = Math.max(params.lambdaMin, lb);

  return [la, lb];
}

export function pickPredictedScore(
  matrix: Map<string, number>,
  la: number,
  lb: number,
  maxGoals: number
): string {
  const rx = Math.min(maxGoals, Math.max(0, Math.round(la)));
  const ry = Math.min(maxGoals, Math.max(0, Math.round(lb)));
  const rounded = `${rx}-${ry}`;
  const roundedProb = matrix.get(rounded) ?? 0;

  const top = [...matrix.entries()].sort((a, b) => b[1] - a[1]);
  const [mode, modeProb] = top[0] ?? ["0-0", 0];

  if (Math.abs(la - lb) <= 0.95 && la + lb <= 3.5) {
    const drawProb = matrix.get("1-1") ?? 0;
    if (drawProb >= modeProb * 0.72) return "1-1";
    const narrow = la >= lb ? "1-0" : "0-1";
    const narrowProb = matrix.get(narrow) ?? 0;
    if (narrowProb >= modeProb * 0.65) return narrow;
  }

  if (lb <= 0.4 && la >= 0.9 && la <= 2.6) {
    const oneZero = "1-0";
    const p = matrix.get(oneZero) ?? 0;
    if (p >= modeProb * 0.5) return oneZero;
  }

  if (la >= 3.0 && la <= 4.25 && lb <= 0.18) {
    const fourZero = matrix.get("4-0") ?? 0;
    if (fourZero >= 0.12) return "4-0";
  }

  if (rx + ry >= 3 && roundedProb >= modeProb * 0.45) return rounded;

  if (la >= 2.2 && lb <= 0.5) {
    const fourZero = matrix.get("4-0") ?? 0;
    const threeZero = matrix.get("3-0") ?? 0;
    if (fourZero >= modeProb * 0.32 || fourZero >= threeZero * 0.72) {
      return "4-0";
    }
  }

  if (la >= 2.4 && lb <= 0.65) {
    const blowout = top.find(([s]) => {
      const [x, y] = s.split("-").map(Number);
      return x >= 3 && y <= 1;
    });
    if (blowout && blowout[1] >= modeProb * 0.42) return blowout[0];
  }

  if (rx + ry >= 2 && roundedProb >= modeProb * 0.6) return rounded;

  const [mx, my] = mode.split("-").map(Number);
  if (mx + my <= 1 && la + lb >= 2.4) {
    const alt = top.find(([s]) => {
      const [x, y] = s.split("-").map(Number);
      return x + y >= 2 && x + y <= 5;
    });
    if (alt && alt[1] >= modeProb * 0.72) return alt[0];
  }

  return mode;
}
