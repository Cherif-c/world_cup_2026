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
  const showVerdicts =
    verdict1x2 !== "live" && verdict1x2 !== "halftime";

  return (
    <article
      className={`match-card ${algeria ? "match-card-algeria" : ""}`}
    >
      <div className="match-card-meta">
        <time dateTime={match.date}>{formatDateFr(match.date)}</time>
        <span>{match.kickoff}</span>
      </div>

      <div className="match-card-body">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <TeamCell team={match.home} highlight={match.home === "Algérie"} />
          </div>
          <div className="shrink-0 px-1 text-center">
            <p className="match-card-score">{match.predictedScore}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-ink-tertiary">
              prédit
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <TeamCell
              team={match.away}
              highlight={match.away === "Algérie"}
              align="right"
            />
          </div>
        </div>
        <p className="match-card-pick">{match.pick1x2Label}</p>
      </div>

      <div className="match-card-probs">
        <div className="prob-cell prob-cell-1">{match.pred[0]}%</div>
        <div className="prob-cell prob-cell-n">{match.pred[1]}%</div>
        <div className="prob-cell prob-cell-2">{match.pred[2]}%</div>
      </div>

      <div className="match-card-footer">
        <div className="match-card-result">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">
            Résultat
          </span>
          <div className="flex items-center gap-1.5">
            {score ? (
              <span
                className={`font-display text-sm font-extrabold tabular-nums ${
                  isLive ? "text-dz-red" : "text-dz-green"
                }`}
              >
                {score}
              </span>
            ) : (
              <span className="text-xs text-ink-tertiary">—</span>
            )}
            {live && (
              <LiveBadge status={live.status} label={live.statusLabel} />
            )}
          </div>
        </div>

        {showVerdicts && (verdict1x2 || verdictScore === "exact") && (
          <div className="match-card-verdicts">
            {verdict1x2 && (
              <VerdictBadge verdict={verdict1x2} variant="1x2" />
            )}
            {verdictScore === "exact" && (
              <VerdictBadge verdict="exact" variant="score" />
            )}
          </div>
        )}
        {(verdict1x2 === "live" || verdict1x2 === "halftime") && live && (
          <div className="match-card-verdicts">
            <LiveBadge
              status={verdict1x2}
              label={live.statusLabel ?? "LIVE"}
            />
          </div>
        )}
      </div>
    </article>
  );
}
