"use client";

import { useState } from "react";
import { GROUP_IDS } from "@/data/groups";
import { useEnrichedMatches } from "@/hooks/useEnrichedMatches";
import { computePredictionStats } from "@/lib/model/enrich";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatPills } from "@/components/ui/StatPills";
import { LiveStatusBar } from "@/components/ui/LiveStatusBar";
import { MatchCard } from "./MatchCard";

const MATCHDAYS: { id: 1 | 2 | 3; label: string }[] = [
  { id: 1, label: "Journée 1" },
  { id: 2, label: "Journée 2" },
  { id: 3, label: "Journée 3" },
];

export function PredictionsView() {
  const [matchday, setMatchday] = useState<1 | 2 | 3>(1);
  const allMatches = useEnrichedMatches();
  const dayMatches = useEnrichedMatches({ matchday });
  const stats = computePredictionStats(allMatches);

  return (
    <>
      <PageHeader
        title="Prédictions"
        subtitle="72 matchs de poule — probabilités recalculées en temps réel depuis le modèle Poisson-Elo. Scores via ESPN."
      >
        <StatPills
          stats={[
            {
              label: "1X2 OK / Raté",
              value: `${stats.pick1x2Ok} / ${stats.pick1x2Rate}`,
            },
            {
              label: "Précision 1X2",
              value: stats.accuracy !== null ? `${stats.accuracy}%` : "—",
              accent: "text-dz-green",
            },
            {
              label: "Score exact",
              value: stats.exact,
              accent: "text-fifa-blue",
            },
            {
              label: "Brier moy.",
              value:
                stats.avgBrier !== null ? stats.avgBrier.toFixed(3) : "—",
            },
            { label: "En direct", value: stats.live, accent: "text-dz-red" },
            { label: "Restants", value: stats.upcoming },
          ]}
        />
      </PageHeader>

      <LiveStatusBar />

      <div className="mb-6 flex flex-wrap gap-2">
        {MATCHDAYS.map((md) => (
          <button
            key={md.id}
            type="button"
            onClick={() => setMatchday(md.id)}
            className={`rounded-card px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition ${
              matchday === md.id
                ? "bg-fifa-blue text-white shadow-md"
                : "border border-line-soft bg-surface-card text-fifa-blue hover:bg-fifa-blue/5"
            }`}
          >
            {md.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GROUP_IDS.map((group) => {
          const groupMatches = dayMatches.filter((m) => m.group === group);
          const hasAlgeria = groupMatches.some(
            (m) => m.home === "Algérie" || m.away === "Algérie"
          );

          return (
            <section
              key={group}
              className={`card-pro ${
                hasAlgeria ? "ring-2 ring-dz-green/30" : ""
              }`}
            >
              <div
                className={`card-pro-header ${
                  hasAlgeria ? "bg-dz-green" : ""
                }`}
              >
                <h2>Groupe {group}</h2>
              </div>
              <div className="space-y-3 p-3">
                {groupMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
