import { VERDICT_1X2_LABELS, VERDICT_LABELS, type Verdict } from "@/lib/scoring";

const STYLES: Record<Exclude<Verdict, null>, string> = {
  exact: "badge-exact",
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
    return (
      <span className="badge badge-neutral">
        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-fifa-blue-light" />
        À venir
      </span>
    );
  }

  const style =
    variant === "score" && verdict === "exact"
      ? "badge-success"
      : STYLES[verdict];

  return <span className={`badge ${style}`}>{labels[verdict]}</span>;
}
