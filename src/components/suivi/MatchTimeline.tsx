"use client";

import type { MatchEvent } from "@/lib/live/match-detail-types";

const ICON: Record<string, string> = {
  Goal: "⚽",
  "Goal - Header": "⚽",
  "Yellow Card": "🟨",
  "Red Card": "🟥",
  Substitution: "↔",
  Halftime: "⏸",
  "Start 2nd Half": "▶",
};

export function MatchTimeline({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-ink-tertiary">
        Aucun événement pour l&apos;instant.
      </p>
    );
  }

  return (
    <ol className="max-h-[520px] space-y-0 overflow-y-auto px-4 py-3">
      {events.map((e) => (
        <li
          key={e.id}
          className={`timeline-item ${e.scoringPlay ? "timeline-item-goal" : ""}`}
        >
          <span className="timeline-minute">{e.minute || "—"}</span>
          <span className="timeline-icon">{ICON[e.type] ?? "•"}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink">{e.shortText || e.type}</p>
            {e.team && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-emerald">
                {e.team}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
