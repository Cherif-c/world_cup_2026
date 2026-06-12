import { VERDICT_LABELS, type Verdict } from "@/lib/scoring";

const STYLES: Record<Exclude<Verdict, null>, string> = {
  exact: "bg-dz-green text-white ring-dz-green",
  vainqueur: "bg-fifa-blue text-white ring-fifa-blue",
  rate: "bg-dz-red text-white ring-dz-red",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  if (!verdict) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-card border border-fifa-blue/30 bg-fifa-blue/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-fifa-blue">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fifa-blue-light" />
        À venir
      </span>
    );
  }
  return (
    <span
      className={`inline-flex rounded-card px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ${STYLES[verdict]}`}
    >
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
