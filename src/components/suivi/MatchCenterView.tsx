"use client";

import type { MatchDetail } from "@/lib/live/match-detail-types";
import { ScoreHero } from "./ScoreHero";
import { StatCompare } from "./StatCompare";
import { MatchTimeline } from "./MatchTimeline";
import { PitchAnalytics } from "./PitchAnalytics";
import { ModelInsight } from "./ModelInsight";
import { useState } from "react";

type Tab = "stats" | "pitch" | "model" | "feed";

export function MatchCenterView({
  detail,
  enriched,
  group,
  matchday,
}: {
  detail: MatchDetail;
  enriched?: {
    predictedScore: string;
    pred: [number, number, number];
    pick1x2Label: string;
  };
  group?: string;
  matchday?: number;
}) {
  const [tab, setTab] = useState<Tab>("stats");
  const isLive =
    detail.status === "live" || detail.status === "halftime";

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "Statistiques" },
    { id: "pitch", label: "Terrain & heatmap" },
    { id: "model", label: "Modèle" },
    { id: "feed", label: "Fil live" },
  ];

  return (
    <div className="space-y-6">
      <ScoreHero detail={detail} isLive={isLive} group={group} matchday={matchday} />

      <div className="analytics-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`analytics-tab ${tab === t.id ? "analytics-tab-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="card-analytics lg:col-span-3">
            <div className="card-analytics-header">
              <h2>Comparaison</h2>
              <span className="text-xs text-ink-onDark-muted">ESPN live</span>
            </div>
            <StatCompare rows={detail.statRows} home={detail.home} away={detail.away} />
          </div>
          <div className="card-analytics lg:col-span-2">
            <div className="card-analytics-header">
              <h2>Timeline</h2>
            </div>
            <MatchTimeline events={detail.events} />
          </div>
        </div>
      )}

      {tab === "pitch" && (
        <PitchAnalytics matchId={detail.matchId} detail={detail} />
      )}

      {tab === "model" && enriched && (
        <ModelInsight detail={detail} enriched={enriched} />
      )}

      {tab === "model" && !enriched && (
        <div className="card-analytics p-6 text-sm text-ink-secondary">
          Données modèle indisponibles pour ce match.
        </div>
      )}

      {tab === "feed" && (
        <div className="card-analytics">
          <div className="card-analytics-header">
            <h2>Commentaires</h2>
          </div>
          <ul className="max-h-[480px] divide-y divide-line-soft overflow-y-auto">
            {detail.commentary.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-ink-tertiary">
                Fil indisponible avant le coup d&apos;envoi.
              </li>
            ) : (
              detail.commentary.map((c, i) => (
                <li key={i} className="flex gap-4 px-5 py-3 text-sm">
                  <span className="w-10 shrink-0 font-mono text-xs font-bold text-accent-emerald">
                    {c.minute || "—"}
                  </span>
                  <span className="text-ink-secondary">{c.text}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
