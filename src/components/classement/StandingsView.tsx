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
        subtitle="Points réels (matchs joués ESPN) + projection modèle sur les matchs restants — tout se recalcule quand vous ajustez les paramètres."
      />

      <LiveStatusBar />

      <div className="mb-4 rounded-card border border-fifa-blue/20 bg-fifa-blue/5 px-4 py-3 text-xs text-ink-secondary">
        <span className="font-semibold text-fifa-blue">Lecture :</span>{" "}
        <span className="font-mono">Pts</span> = bilan actuel ·{" "}
        <span className="font-mono">Proj.</span> = Pts + espérance 1X2 du
        modèle sur les matchs à venir de la poule. Les 2 premiers qualifiés
        (sur projection).
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {standings.map(({ group, teams }) => {
          const hasAlgeria = teams.some((t) => t.team === "Algérie");

          return (
            <section
              key={group}
              className={`card-pro overflow-hidden ${
                hasAlgeria ? "ring-2 ring-dz-green/30" : ""
              }`}
            >
              <div
                className={`card-pro-header flex items-center justify-between ${
                  hasAlgeria ? "bg-dz-green" : ""
                }`}
              >
                <h2>Groupe {group}</h2>
                <span className="text-[10px] font-normal normal-case tracking-normal text-white/70">
                  Top 2 → 8es
                </span>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line-soft bg-surface-muted text-[10px] uppercase tracking-wider text-ink-tertiary">
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Équipe</th>
                    <th className="px-1 py-2 text-center">J</th>
                    <th className="px-1 py-2 text-center">Pts</th>
                    <th className="px-1 py-2 text-center font-bold text-fifa-blue">
                      Proj.
                    </th>
                    <th className="hidden px-1 py-2 text-center sm:table-cell">
                      +/−
                    </th>
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
                          isAlg
                            ? "bg-dz-green/[0.08]"
                            : qualified
                              ? "bg-fifa-blue/[0.04]"
                              : ""
                        }`}
                      >
                        <td className="px-2 py-2 font-mono font-bold text-ink-secondary">
                          {t.rank}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-1.5">
                            <FlagIcon team={t.team} size={18} />
                            <span
                              className={`truncate font-semibold ${
                                isAlg ? "text-dz-green" : "text-ink"
                              }`}
                            >
                              {t.team}
                            </span>
                            {qualified && (
                              <span className="shrink-0 text-[9px] font-bold uppercase text-fifa-blue">
                                Q
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-1 py-2 text-center font-mono text-ink-secondary">
                          {t.played}
                        </td>
                        <td className="px-1 py-2 text-center font-mono font-bold">
                          {t.points}
                        </td>
                        <td className="px-1 py-2 text-center font-mono font-bold text-fifa-blue">
                          {t.projectedPoints.toFixed(1)}
                        </td>
                        <td className="hidden px-1 py-2 text-center font-mono sm:table-cell">
                          <span
                            className={
                              t.gd > 0
                                ? "text-dz-green"
                                : t.gd < 0
                                  ? "text-dz-red"
                                  : "text-ink-tertiary"
                            }
                          >
                            {t.gd > 0 ? "+" : ""}
                            {t.gd}
                          </span>
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
