import type { StrengthAdj } from "@/data/team-strength";
import { TEAM_STRENGTH } from "@/data/team-strength";

export interface GlobalParams {
  muTotal: number;
  /** μ par journée de poule — prime sur muTotal si défini */
  muByMatchday: Record<1 | 2 | 3, number>;
  eloPerGd: number;
  rhoDc: number;
  lambdaMin: number;
  maxGoals: number;
  zCred: number;
  ratioExponent: number;
}

export interface ContextAdj {
  hote: number;
  quasiDomicile: number;
  altitudeAzteca: number;
}

export interface ModelConfig {
  global: GlobalParams;
  contextAdj: ContextAdj;
  elo: Record<string, number>;
  strength: Record<string, StrengthAdj>;
}

export interface MatchAdjustments {
  adjEloA: number;
  adjEloB: number;
  bonusLambdaA: number;
  bonusLambdaB: number;
}

export interface PricingResult {
  lambdaA: number;
  lambdaB: number;
  eloA: number;
  eloB: number;
  diffElo: number;
  pModel: [number, number, number];
  pMarket?: [number, number, number];
  pFinal: [number, number, number];
  fairOdds: [number, number, number];
  topScores: { score: string; prob: number }[];
  over25: number;
  btts: number;
  modeScore: string;
  /** Score retenu pour affichage (arrondi λ ou mode selon contexte) */
  predictedScore: string;
}
