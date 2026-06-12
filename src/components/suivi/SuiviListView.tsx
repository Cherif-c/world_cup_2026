"use client";

import Link from "next/link";
import { useEnrichedMatches } from "@/hooks/useEnrichedMatches";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveStatusBar } from "@/components/ui/LiveStatusBar";
import { TeamCell } from "@/components/ui/TeamCell";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { formatDateFr, involvesAlgeria } from "@/data/fixtures";
import { displayScore } from "@/lib/model/enrich";

export function SuiviListView() {
  const matches = useEnrichedMatches();

  const sorted = [...matches].sort((a, b) => {
    const liveA =
      a.live?.status === "live" || a.live?.status === "halftime" ? 0 : 1;
    const liveB =
      b.live?.status === "live" || b.live?.status === "halftime" ? 0 : 1;
    if (liveA !== liveB) return liveA - liveB;
    return a.date.localeCompare(b.date) || a.kickoff.localeCompare(b.kickoff);
  });

  return (
    <>
      <PageHeader
        title="Suivi live"
        subtitle="Centre de match analytique — stats ESPN, heatmap, timeline et comparaison modèle."
      />
      <LiveStatusBar />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((m) => {
          const live = m.live;
          const score = displayScore({ ...m, result: m.result ?? null }, live);
          const isLive =
            live?.status === "live" || live?.status === "halftime";
          const algeria = involvesAlgeria(m);

          return (
            <Link
              key={m.id}
              href={`/suivi/${m.id}`}
              className={`suivi-card group ${algeria ? "suivi-card-algeria" : ""} ${isLive ? "suivi-card-live" : ""}`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">
                <span>
                  Groupe {m.group} · J{m.matchday}
                </span>
                <time dateTime={m.date}>{formatDateFr(m.date)}</time>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <TeamCell team={m.home} highlight={m.home === "Algérie"} />
                </div>
                <div className="shrink-0 px-2 text-center">
                  {score ? (
                    <span
                      className={`font-display text-lg font-extrabold tabular-nums ${
                        isLive ? "text-dz-red" : "text-accent-emerald"
                      }`}
                    >
                      {score}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-ink-tertiary">vs</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <TeamCell
                    team={m.away}
                    highlight={m.away === "Algérie"}
                    align="right"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
                {live ? (
                  <LiveBadge status={live.status} label={live.statusLabel} />
                ) : (
                  <span className="text-xs text-ink-tertiary">{m.kickoff}</span>
                )}
                <span className="text-xs font-bold uppercase tracking-wide text-accent-emerald opacity-0 transition group-hover:opacity-100">
                  Analyse →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
