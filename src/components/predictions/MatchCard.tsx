"use client";

import type { EnrichedMatch } from "@/lib/model/enrich";
import {
  displayScore,
  liveVerdict,
  liveVerdict1x2,
} from "@/lib/model/enrich";
import { formatDateFr, involvesAlgeria } from "@/data/fixtures";
import { TeamCell } from "@/components/ui/TeamCell";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { LiveBadge } from "@/components/ui/LiveBadge";

export function MatchCard({ match }: { match: EnrichedMatch }) {
  const live = match.live;
  const verdictScore = liveVerdict(match, live);
  const verdict1x2 = liveVerdict1x2(match, live);
  const score = displayScore({ ...match, result: null }, live);
  const isLive =
    live?.status === "live" || live?.status === "halftime";
  const algeria = involvesAlgeria(match);

  return (
    <article
      className={`match-card ${algeria ? "match-card-highlight" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-ink-tertiary">
        <time dateTime={match.date}>
          {formatDateFr(match.date)} · {match.kickoff}
        </time>
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <TeamCell team={match.home} highlight={match.home === "Algérie"} />
        </div>

        <div className="shrink-0 px-2 text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-ink">
            {match.predictedScore}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-tertiary">prédit</p>
        </div>

        <div className="min-w-0 flex-1">
          <TeamCell
            team={match.away}
            highlight={match.away === "Algérie"}
            align="right"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-ink-secondary">
        {match.pick1x2Label}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line-soft pt-3">
        <div className="flex gap-2.5 font-mono text-xs tabular-nums">
          <span className="font-medium text-ink">{match.pred[0]}%</span>
          <span className="text-ink-tertiary">{match.pred[1]}%</span>
          <span className="font-medium text-ink">{match.pred[2]}%</span>
        </div>

        <div className="flex items-center gap-2">
          {score ? (
            <span
              className={`font-display text-sm font-semibold tabular-nums ${
                isLive ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {score}
            </span>
          ) : null}
          {live && (
            <LiveBadge status={live.status} label={live.statusLabel} />
          )}
          {verdict1x2 === "live" || verdict1x2 === "halftime" ? null : (
            <>
              <VerdictBadge verdict={verdict1x2} variant="1x2" />
              {verdictScore === "exact" && (
                <VerdictBadge verdict="exact" variant="score" />
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
