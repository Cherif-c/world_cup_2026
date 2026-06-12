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
        subtitle="Probabilités 1X2 et scores projetés pour les 72 matchs de poule."
      >
        <StatPills
          stats={[
            {
              label: "Précision 1X2",
              value: stats.accuracy !== null ? `${stats.accuracy}%` : "—",
            },
            {
              label: "Scores exacts",
              value: stats.exact,
            },
            {
              label: "Brier",
              value:
                stats.avgBrier !== null ? stats.avgBrier.toFixed(3) : "—",
            },
            { label: "En direct", value: stats.live },
            { label: "Restants", value: stats.upcoming },
          ]}
        />
      </PageHeader>

      <LiveStatusBar />

      <div className="segmented mb-8">
        {MATCHDAYS.map((md) => (
          <button
            key={md.id}
            type="button"
            onClick={() => setMatchday(md.id)}
            className={`segmented-btn ${
              matchday === md.id ? "segmented-btn-active" : ""
            }`}
          >
            {md.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GROUP_IDS.map((group) => {
          const groupMatches = dayMatches.filter((m) => m.group === group);
          const hasAlgeria = groupMatches.some(
            (m) => m.home === "Algérie" || m.away === "Algérie"
          );

          return (
            <section
              key={group}
              className={`card-pro ${hasAlgeria ? "ring-1 ring-emerald-200" : ""}`}
            >
              <div className="card-pro-header flex items-center justify-between">
                <h2>Groupe {group}</h2>
              </div>
              <div className="space-y-2 p-3">
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
