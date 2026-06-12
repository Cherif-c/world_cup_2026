export type Verdict = "exact" | "vainqueur" | "rate" | null;

export type Pick1x2 = "1" | "N" | "2";

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

export function pick1x2(pred: [number, number, number]): Pick1x2 {
  const max = Math.max(...pred);
  if (pred[0] === max) return "1";
  if (pred[1] === max) return "N";
  return "2";
}

export function pick1x2Label(
  pick: Pick1x2,
  home: string,
  away: string
): string {
  if (pick === "1") return `1 · ${home}`;
  if (pick === "2") return `2 · ${away}`;
  return "N · Nul";
}

export function getVerdict(
  predicted: string,
  result: string | null
): Verdict {
  if (!result) return null;
  if (result === predicted) return "exact";
  return scoreSign(result) === scoreSign(predicted) ? "vainqueur" : "rate";
}

export function getVerdict1x2(
  pred: [number, number, number],
  result: string | null
): Verdict {
  if (!result) return null;
  const pick = pick1x2(pred);
  const sign = scoreSign(result);
  if (pick === "N" && sign === 0) return "vainqueur";
  if (pick === "1" && sign > 0) return "vainqueur";
  if (pick === "2" && sign < 0) return "vainqueur";
  return "rate";
}

export const VERDICT_LABELS: Record<Exclude<Verdict, null>, string> = {
  exact: "Exact",
  vainqueur: "Vainqueur",
  rate: "Raté",
};

export const VERDICT_1X2_LABELS: Record<Exclude<Verdict, null>, string> = {
  exact: "1X2 OK",
  vainqueur: "1X2 OK",
  rate: "1X2 raté",
};
