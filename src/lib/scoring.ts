export type Verdict = "exact" | "vainqueur" | "rate" | null;

export function scoreSign(score: string): number {
  const [x, y] = score.split("-").map(Number);
  return Math.sign(x - y);
}

export function brierScore(pred: [number, number, number], result: string): number {
  const sign = scoreSign(result);
  const outcome = [0, 0, 0] as [number, number, number];
  if (sign > 0) outcome[0] = 1;
  else if (sign === 0) outcome[1] = 1;
  else outcome[2] = 1;

  return pred.reduce((acc, p, i) => acc + Math.pow(p / 100 - outcome[i], 2), 0);
}

export function getVerdict(
  predicted: string,
  result: string | null
): Verdict {
  if (!result) return null;
  if (result === predicted) return "exact";
  return scoreSign(result) === scoreSign(predicted) ? "vainqueur" : "rate";
}

export const VERDICT_LABELS: Record<Exclude<Verdict, null>, string> = {
  exact: "Exact",
  vainqueur: "Vainqueur",
  rate: "Raté",
};
