"use client";

import type { MatchDetail } from "@/lib/live/match-detail-types";
import { TeamCell } from "@/components/ui/TeamCell";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { formatDateFr } from "@/data/fixtures";
import { involvesAlgeria } from "@/data/fixtures";

export function ScoreHero({
  detail,
  isLive,
  group,
  matchday,
}: {
  detail: MatchDetail;
  isLive: boolean;
  group?: string;
  matchday?: number;
}) {
  const algeria = involvesAlgeria(detail);
  const hasScore =
    detail.homeScore !== null && detail.awayScore !== null;

  return (
    <section
      className={`score-hero ${algeria ? "score-hero-algeria" : ""} ${isLive ? "score-hero-live" : ""}`}
    >
      <div className="score-hero-meta">
        <span>
          {group ? `Groupe ${group}` : ""}
          {group && matchday ? " · " : ""}
          {matchday ? `Journée ${matchday}` : ""}
        </span>
        <time dateTime={detail.date}>{formatDateFr(detail.date)}</time>
        {detail.venue && <span className="hidden sm:inline">{detail.venue}</span>}
      </div>

      <div className="score-hero-grid">
        <div className="score-hero-team">
          <TeamCell team={detail.home} highlight={detail.home === "Algérie"} size="lg" />
        </div>

        <div className="score-hero-center">
          {hasScore ? (
            <p className="score-hero-score">
              {detail.homeScore}
              <span className="score-hero-sep">:</span>
              {detail.awayScore}
            </p>
          ) : (
            <p className="score-hero-kickoff">vs</p>
          )}
          <div className="mt-2 flex items-center justify-center gap-2">
            {isLive ? (
              <LiveBadge status={detail.status} label={detail.statusLabel} />
            ) : (
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-onDark-muted">
                {detail.statusLabel}
              </span>
            )}
          </div>
        </div>

        <div className="score-hero-team score-hero-team-away">
          <TeamCell
            team={detail.away}
            highlight={detail.away === "Algérie"}
            align="right"
            size="lg"
          />
        </div>
      </div>

      {detail.homeStats.possession != null && detail.awayStats.possession != null && (
        <div className="score-hero-possession">
          <span className="font-mono text-sm font-bold tabular-nums">
            {detail.homeStats.possession}%
          </span>
          <div className="score-hero-poss-bar">
            <div
              className="score-hero-poss-home"
              style={{ width: `${detail.homeStats.possession}%` }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-onDark-muted">
            Possession
          </span>
          <div className="score-hero-poss-bar">
            <div
              className="score-hero-poss-away"
              style={{ width: `${detail.awayStats.possession}%` }}
            />
          </div>
          <span className="font-mono text-sm font-bold tabular-nums">
            {detail.awayStats.possession}%
          </span>
        </div>
      )}
    </section>
  );
}
