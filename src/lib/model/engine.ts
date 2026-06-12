import type {
  GlobalParams,
  MatchAdjustments,
  ModelConfig,
  PricingResult,
} from "./types";

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poissonPmf(k: number, lam: number): number {
  return (Math.exp(-lam) * Math.pow(lam, k)) / factorial(k);
}

function tauDixonColes(
  x: number,
  y: number,
  la: number,
  lb: number,
  rho: number
): number {
  if (x === 0 && y === 0) return 1 - la * lb * rho;
  if (x === 0 && y === 1) return 1 + la * rho;
  if (x === 1 && y === 0) return 1 + lb * rho;
  if (x === 1 && y === 1) return 1 - rho;
  return 1;
}

export function intensites(
  eloA: number,
  eloB: number,
  adj: MatchAdjustments,
  params: GlobalParams
): [number, number] {
  const d = eloA + adj.adjEloA - (eloB + adj.adjEloB);
  const w = 1 / (1 + Math.pow(10, -d / 400));
  const ratio = Math.pow(w / (1 - w), params.ratioExponent);
  const lb = Math.max(
    params.lambdaMin,
    params.muTotal / (1 + ratio) + adj.bonusLambdaB
  );
  const la = Math.max(
    params.lambdaMin,
    (params.muTotal * ratio) / (1 + ratio) + adj.bonusLambdaA
  );
  return [la, lb];
}

export function scoreMatrix(
  la: number,
  lb: number,
  params: GlobalParams
): Map<string, number> {
  const m = new Map<string, number>();
  let sum = 0;
  for (let x = 0; x <= params.maxGoals; x++) {
    for (let y = 0; y <= params.maxGoals; y++) {
      const p =
        poissonPmf(x, la) *
        poissonPmf(y, lb) *
        tauDixonColes(x, y, la, lb, params.rhoDc);
      const val = Math.max(0, p);
      m.set(`${x}-${y}`, val);
      sum += val;
    }
  }
  for (const [k, v] of m) m.set(k, v / sum);
  return m;
}

export function outcomes1n2(m: Map<string, number>): [number, number, number] {
  let p1 = 0,
    pn = 0,
    p2 = 0;
  for (const [key, p] of m) {
    const [x, y] = key.split("-").map(Number);
    if (x > y) p1 += p;
    else if (x === y) pn += p;
    else p2 += p;
  }
  return [p1, pn, p2];
}

export function devig(odds: [number, number, number]): [number, number, number] {
  const inv = odds.map((c) => 1 / c);
  const s = inv.reduce((a, b) => a + b, 0);
  return inv.map((i) => i / s) as [number, number, number];
}

export function credibilite(
  pModel: [number, number, number],
  pMarket: [number, number, number],
  z: number
): [number, number, number] {
  const blend = pModel.map((pm, i) => z * pm + (1 - z) * pMarket[i]);
  const s = blend.reduce((a, b) => a + b, 0);
  return blend.map((b) => b / s) as [number, number, number];
}

export function priceMatch(
  teamA: string,
  teamB: string,
  config: ModelConfig,
  adj: MatchAdjustments = {
    adjEloA: 0,
    adjEloB: 0,
    bonusLambdaA: 0,
    bonusLambdaB: 0,
  },
  marketOdds?: [number, number, number]
): PricingResult {
  const eloA = config.elo[teamA] ?? 1700;
  const eloB = config.elo[teamB] ?? 1700;
  const [la, lb] = intensites(eloA, eloB, adj, config.global);
  const matrix = scoreMatrix(la, lb, config.global);
  const pModel = outcomes1n2(matrix);

  let pFinal = pModel;
  let pMarket: [number, number, number] | undefined;
  if (marketOdds) {
    pMarket = devig(marketOdds);
    pFinal = credibilite(pModel, pMarket, config.global.zCred);
  }

  const topScores = [...matrix.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([score, prob]) => ({ score, prob }));

  let over25 = 0;
  let btts = 0;
  for (const [key, p] of matrix) {
    const [x, y] = key.split("-").map(Number);
    if (x + y > 2.5) over25 += p;
    if (x > 0 && y > 0) btts += p;
  }

  const modeScore = topScores[0]?.score ?? "0-0";

  return {
    lambdaA: la,
    lambdaB: lb,
    eloA,
    eloB,
    diffElo: eloA + adj.adjEloA - (eloB + adj.adjEloB),
    pModel,
    pMarket,
    pFinal,
    fairOdds: pFinal.map((p) => 1 / p) as [number, number, number],
    topScores,
    over25,
    btts,
    modeScore,
  };
}
