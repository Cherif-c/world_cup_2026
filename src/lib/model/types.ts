export interface GlobalParams {
  muTotal: number;
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
}
