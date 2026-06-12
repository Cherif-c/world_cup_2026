import type { MatchStatus } from "@/lib/live/types";

const STYLES: Record<MatchStatus, string> = {
  live: "bg-dz-red text-white animate-pulse",
  halftime: "bg-fifa-blue text-white",
  finished: "bg-dz-green text-white",
  scheduled: "bg-fifa-blue/10 text-fifa-blue",
  postponed: "bg-ink-tertiary/20 text-ink-secondary",
  unknown: "bg-surface-muted text-ink-tertiary",
};

interface LiveBadgeProps {
  status: MatchStatus;
  label: string;
}

export function LiveBadge({ status, label }: LiveBadgeProps) {
  if (status === "scheduled") return null;

  return (
    <span
      className={`ml-1.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STYLES[status]}`}
    >
      {status === "live" && (
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white" />
      )}
      {label}
    </span>
  );
}
