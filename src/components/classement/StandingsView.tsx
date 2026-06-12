"use client";

import { useMemo } from "react";
import { useEnrichedMatches } from "@/hooks/useEnrichedMatches";
import { computeAllStandings } from "@/lib/standings";
import { PageHeader } from "@/components/ui/PageHeader";
import { LiveStatusBar } from "@/components/ui/LiveStatusBar";
import { FlagIcon } from "@/components/ui/FlagIcon";

export function StandingsView() {
  const matches = useEnrichedMatches();
  const standings = useMemo(() => computeAllStandings(matches), [matches]);

  return (
    <>
      <PageHeader
        title="Classement"
        subtitle="Points réels et projection modèle par poule. Les deux premiers se qualifient."
      />

      <LiveStatusBar />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {standings.map(({ group, teams }) => {
          const hasAlgeria = teams.some((t) => t.team === "Algérie");

          return (
            <section
              key={group}
              className={`card-pro overflow-hidden ${
                hasAlgeria ? "ring-1 ring-emerald-200" : ""
              }`}
            >
              <div className="card-pro-header flex items-center justify-between">
                <h2>Groupe {group}</h2>
                <span className="text-xs text-ink-tertiary">Top 2</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-xs text-ink-tertiary">
                    <th className="px-3 py-2 text-left font-medium">#</th>
                    <th className="px-3 py-2 text-left font-medium">Équipe</th>
                    <th className="px-2 py-2 text-center font-medium">J</th>
                    <th className="px-2 py-2 text-center font-medium">Pts</th>
                    <th className="px-2 py-2 text-center font-medium">Proj.</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => {
                    const qualified = t.rank <= 2;
                    const isAlg = t.team === "Algérie";

                    return (
                      <tr
                        key={t.team}
                        className={`border-b border-line-soft last:border-0 ${
                          isAlg ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5 font-mono text-xs text-ink-tertiary">
                          {t.rank}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <FlagIcon team={t.team} size={16} />
                            <span
                              className={`truncate text-sm ${
                                isAlg
                                  ? "font-medium text-emerald-800"
                                  : "text-ink"
                              }`}
                            >
                              {t.team}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-xs text-ink-secondary">
                          {t.played}
                        </td>
                        <td className="px-2 py-2.5 text-center font-mono text-sm font-medium">
                          {t.points}
                        </td>
                        <td
                          className={`px-2 py-2.5 text-center font-mono text-sm font-medium ${
                            qualified ? "text-fifa-blue" : "text-ink-secondary"
                          }`}
                        >
                          {t.projectedPoints.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          );
        })}
      </div>
    </>
  );
}
