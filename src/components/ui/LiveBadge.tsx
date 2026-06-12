import type { MatchStatus } from "@/lib/live/types";

const STYLES: Record<MatchStatus, string> = {
  live: "badge badge-live",
  halftime: "badge badge-info",
  finished: "badge badge-success",
  scheduled: "badge badge-neutral",
  postponed: "badge badge-neutral",
  unknown: "badge badge-neutral",
};

interface LiveBadgeProps {
  status: MatchStatus;
  label: string;
}

export function LiveBadge({ status, label }: LiveBadgeProps) {
  if (status === "scheduled") return null;

  return (
    <span className={STYLES[status]}>
      {status === "live" && (
        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
      )}
      {label}
    </span>
  );
}
