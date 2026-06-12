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

/**
 * Score affiché = mode de la matrice Dixon-Coles. Un seul tie-break :
 * sur un match équilibré, si le 1-1 est quasi aussi probable que le mode
 * (≥ 90 %), on préfère le nul à un 1-0 « pile ou face ».
 *
 * L'ancienne version empilait des heuristiques à seuils magiques
 * (cas spéciaux 4-0, etc.) — invendable et impossible à backtester.
 * Si tu veux un score plus agressif, ajuste λ via team-strength,
 * pas la règle de lecture de la matrice.
 */
export function pickPredictedScore(
  matrix: Map<string, number>,
  la: number,
  lb: number,
  _maxGoals: number
): string {
  const top = [...matrix.entries()].sort((a, b) => b[1] - a[1]);
  const [mode, modeProb] = top[0] ?? ["1-1", 0];

  if (Math.abs(la - lb) <= 0.35) {
    const drawProb = matrix.get("1-1") ?? 0;
    if (drawProb >= modeProb * 0.9) return "1-1";
  }

  return mode;
}
