"use client";

import { flattenMatches } from "@/data/matches";
import { useLiveScores } from "@/context/LiveScoresContext";
import {
  computeLiveStats,
  displayScore,
  liveBrier,
  liveVerdict,
} from "@/lib/live/merge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatPills } from "@/components/ui/StatPills";
import { TeamCell } from "@/components/ui/TeamCell";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { LiveBadge } from "@/components/ui/LiveBadge";
import { LiveStatusBar } from "@/components/ui/LiveStatusBar";
import { formatDateFr, involvesAlgeria } from "@/data/matches";

export function PredictionsTable() {
  const matches = flattenMatches();
  const { getUpdate, data } = useLiveScores();

  const updatesMap = new Map(
    data?.matches.map((u) => [u.matchId, u]) ?? []
  );
  const stats = computeLiveStats(matches, updatesMap);

  return (
    <>
      <PageHeader
        title="Prédictions"
        subtitle="Scores mis à jour en direct via API-Football — probabilités 1X2, verdict et Brier recalculés à la fin des matchs."
      >
        <StatPills
          stats={[
            {
              label: "Exact / Vainq. / Raté",
              value: `${stats.exact} / ${stats.vainqueur} / ${stats.rate}`,
            },
            {
              label: "Précision 1X2",
              value: stats.accuracy !== null ? `${stats.accuracy}%` : "—",
              accent: "text-dz-green",
            },
            {
              label: "Brier moy.",
              value:
                stats.avgBrier !== null ? stats.avgBrier.toFixed(3) : "—",
              accent: "text-fifa-blue",
            },
            { label: "En direct", value: stats.live, accent: "text-dz-red" },
            { label: "Restants", value: stats.upcoming },
          ]}
        />
      </PageHeader>

      <LiveStatusBar />

      <div className="card-pro overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Date</th>
                <th>Grp</th>
                <th>Domicile</th>
                <th className="text-center">—</th>
                <th>Extérieur</th>
                <th className="text-center">1</th>
                <th className="text-center">N</th>
                <th className="text-center">2</th>
                <th className="text-center">Prédit</th>
                <th className="text-center">Réel</th>
                <th>Verdict</th>
                <th className="text-right">Brier</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const live = getUpdate(m.id);
                const verdict = liveVerdict(m, live);
                const brier = liveBrier(m, live);
                const score = displayScore(m, live);
                const algeria = involvesAlgeria(m);
                const isLive =
                  live?.status === "live" || live?.status === "halftime";

                return (
                  <tr
                    key={m.id}
                    className={algeria ? "row-algeria" : undefined}
                  >
                    <td className="whitespace-nowrap font-mono text-xs text-ink-secondary">
                      {formatDateFr(m.date)}
                      <span className="ml-1 text-ink-tertiary">
                        {m.kickoff}
                      </span>
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
                    <td className="text-center font-mono text-xs font-semibold text-fifa-blue">
                      {m.pred[0]}%
                    </td>
                    <td className="text-center font-mono text-xs text-ink-secondary">
                      {m.pred[1]}%
                    </td>
                    <td className="text-center font-mono text-xs font-semibold text-dz-red">
                      {m.pred[2]}%
                    </td>
                    <td className="text-center font-display text-base font-extrabold text-fifa-blue-dark">
                      {m.predictedScore}
                    </td>
                    <td className="text-center font-display text-base font-extrabold">
                      {score ? (
                        <span
                          className={
                            isLive ? "text-dz-red" : "text-dz-green"
                          }
                        >
                          {score}
                          {live && (
                            <LiveBadge
                              status={live.status}
                              label={live.statusLabel}
                            />
                          )}
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
                    <td className="text-right font-mono text-xs font-semibold text-fifa-blue">
                      {brier !== null ? brier.toFixed(3) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {matches.some((m) => m.revision) && (
        <div className="mt-4 space-y-2">
          {matches
            .filter((m) => m.revision)
            .map((m) => (
              <p key={m.id} className="callout-dz text-xs">
                <span className="font-semibold text-ink">
                  {m.home} vs {m.away} :
                </span>{" "}
                {m.revision}
              </p>
            ))}
        </div>
      )}
    </>
  );
}
