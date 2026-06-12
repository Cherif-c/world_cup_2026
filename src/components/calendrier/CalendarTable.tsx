"use client";

import { flattenMatches, formatDateFr, involvesAlgeria } from "@/data/matches";
import { useLiveScores } from "@/context/LiveScoresContext";
import { displayScore, liveVerdict } from "@/lib/live/merge";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamCell } from "@/components/ui/TeamCell";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { LiveStatusBar } from "@/components/ui/LiveStatusBar";

export function CalendarTable() {
  const matches = flattenMatches();
  const { getUpdate, data } = useLiveScores();

  const played = matches.filter((m) => {
    const live = getUpdate(m.id);
    return live?.status === "finished" || (!live && m.result);
  }).length;

  const liveCount = data?.liveCount ?? 0;

  return (
    <>
      <PageHeader
        title="Calendrier"
        subtitle="Programme phase de poules — scores synchronisés en direct."
      >
        <div className="flex gap-2">
          {liveCount > 0 && (
            <div className="stat-pill border-dz-red/30">
              <p className="stat-pill-label text-dz-red">En direct</p>
              <p className="stat-pill-value text-dz-red">{liveCount}</p>
            </div>
          )}
          <div className="stat-pill">
            <p className="stat-pill-label">Joués</p>
            <p className="stat-pill-value text-dz-green">
              {played}/{matches.length}
            </p>
          </div>
        </div>
      </PageHeader>

      <LiveStatusBar />

      <div className="card-pro overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Grp</th>
                <th>Domicile</th>
                <th className="text-center">—</th>
                <th>Extérieur</th>
                <th>Stade</th>
                <th className="text-center">Score</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const live = getUpdate(m.id);
                const verdict = liveVerdict(m, live);
                const score = displayScore(m, live);
                const isLive =
                  live?.status === "live" || live?.status === "halftime";

                return (
                  <tr
                    key={m.id}
                    className={involvesAlgeria(m) ? "row-algeria" : undefined}
                  >
                    <td className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatDateFr(m.date)}
                    </td>
                    <td className="font-mono text-xs text-ink-secondary">
                      {m.kickoff}
                    </td>
                    <td>
                      <span className="badge-group">{m.group}</span>
                    </td>
                    <td>
                      <TeamCell
                        team={m.home}
                        highlight={m.home === "Algérie"}
                      />
                    </td>
                    <td className="text-center text-xs text-ink-tertiary">
                      vs
                    </td>
                    <td>
                      <TeamCell
                        team={m.away}
                        highlight={m.away === "Algérie"}
                      />
                    </td>
                    <td className="max-w-[200px] truncate text-xs text-ink-secondary">
                      {m.venue}
                    </td>
                    <td className="text-center font-display text-base font-extrabold">
                      {score ? (
                        <span
                          className={
                            isLive ? "text-dz-red" : "text-dz-green"
                          }
                        >
                          {score}
                        </span>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      {verdict === "live" || verdict === "halftime" ? (
                        <LiveBadge
                          status={verdict}
                          label={live?.statusLabel ?? "LIVE"}
                        />
                      ) : (
                        <VerdictBadge verdict={verdict} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
