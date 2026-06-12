"use client";

import type { EnrichedMatch } from "@/lib/model/enrich";
import {
  displayScore,
  liveBrier,
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
  const brier = liveBrier(match, live);
  const score = displayScore({ ...match, result: null }, live);
  const isLive =
    live?.status === "live" || live?.status === "halftime";
  const algeria = involvesAlgeria(match);
  const hasMarket = !!match.pricing.pMarket;

  return (
    <div
      className={`rounded-card border px-3 py-2.5 ${
        algeria
          ? "border-dz-green/40 bg-dz-green/[0.04]"
          : "border-line-soft bg-surface-card"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">
        <span>
          {formatDateFr(match.date)} · {match.kickoff}
        </span>
        <span className="truncate text-right">{match.venue}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <TeamCell team={match.home} highlight={match.home === "Algérie"} />
        </div>
        <div className="shrink-0 text-center">
          <p className="font-display text-lg font-extrabold text-fifa-blue-dark">
            {match.predictedScore}
          </p>
          <p className="font-mono text-[10px] text-ink-tertiary">score mode</p>
        </div>
        <div className="min-w-0 flex-1 text-right">
          <TeamCell
            team={match.away}
            highlight={match.away === "Algérie"}
            align="right"
          />
        </div>
      </div>

      <p className="mt-1.5 text-center font-mono text-[10px] font-semibold text-dz-green">
        {match.pick1x2Label}
        {hasMarket && (
          <span className="ml-1 font-normal text-ink-tertiary">· marché</span>
        )}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-line-soft pt-2">
        <div className="flex gap-2 font-mono text-[11px]">
          <span className="font-semibold text-fifa-blue">{match.pred[0]}%</span>
          <span className="text-ink-secondary">{match.pred[1]}%</span>
          <span className="font-semibold text-dz-red">{match.pred[2]}%</span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {score ? (
            <span
              className={`font-display text-sm font-bold ${
                isLive ? "text-dz-red" : "text-dz-green"
              }`}
            >
              {score}
              {live && (
                <LiveBadge status={live.status} label={live.statusLabel} />
              )}
            </span>
          ) : (
            <span className="text-xs text-ink-tertiary">—</span>
          )}
          {verdict1x2 === "live" || verdict1x2 === "halftime" ? (
            <LiveBadge
              status={verdict1x2}
              label={live?.statusLabel ?? "LIVE"}
            />
          ) : (
            <>
              <VerdictBadge verdict={verdict1x2} variant="1x2" />
              {verdictScore === "exact" && (
                <VerdictBadge verdict="exact" variant="score" />
              )}
            </>
          )}
          {brier !== null && (
            <span className="font-mono text-[10px] text-fifa-blue">
              {brier.toFixed(3)}
            </span>
          )}
        </div>
      </div>

      {match.revision && (
        <p className="mt-2 text-[10px] leading-snug text-ink-secondary">
          {match.revision}
        </p>
      )}
    </div>
  );
}
