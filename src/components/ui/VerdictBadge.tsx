import { VERDICT_LABELS, type Verdict } from "@/lib/scoring";

const STYLES: Record<Exclude<Verdict, null>, string> = {
  exact: "bg-dz-green/10 text-dz-green ring-dz-green/25",
  vainqueur: "bg-fifa-gold/15 text-fifa-gold ring-fifa-gold/30",
  rate: "bg-dz-red/10 text-dz-red ring-dz-red/25",
};

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  if (!verdict) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-tertiary ring-1 ring-line-soft">
        <span className="h-1.5 w-1.5 rounded-full bg-fifa-gold" />
        À venir
      </span>
    );
  }
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${STYLES[verdict]}`}
    >
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
