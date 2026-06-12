import { VERDICT_1X2_LABELS, VERDICT_LABELS, type Verdict } from "@/lib/scoring";

const STYLES: Record<Exclude<Verdict, null>, string> = {
  exact: "badge-success",
  vainqueur: "badge-info",
  rate: "badge-error",
};

export function VerdictBadge({
  verdict,
  variant = "1x2",
}: {
  verdict: Verdict;
  variant?: "score" | "1x2";
}) {
  const labels = variant === "1x2" ? VERDICT_1X2_LABELS : VERDICT_LABELS;

  if (!verdict) {
    return <span className="badge badge-neutral">À venir</span>;
  }

  return <span className={`badge ${STYLES[verdict]}`}>{labels[verdict]}</span>;
}
