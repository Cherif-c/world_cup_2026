"use client";

import type { MatchDetail } from "@/lib/live/match-detail-types";
import { brierScore, getVerdict, VERDICT_LABELS } from "@/lib/scoring";

export function ModelInsight({
  detail,
  enriched,
}: {
  detail: MatchDetail;
  enriched: {
    predictedScore: string;
    pred: [number, number, number];
    pick1x2Label: string;
  };
}) {
  const actual =
    detail.homeScore !== null && detail.awayScore !== null
      ? `${detail.homeScore}-${detail.awayScore}`
      : null;

  const pickIdx = enriched.pred.indexOf(Math.max(...enriched.pred));
  const labels = ["1", "N", "2"];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card-analytics p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent-emerald">
          Projection modèle
        </h3>
        <p className="mt-4 font-display text-4xl font-extrabold tabular-nums text-ink">
          {enriched.predictedScore}
        </p>
        <p className="mt-2 text-sm font-semibold text-dz-green">
          {enriched.pick1x2Label}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {enriched.pred.map((p, i) => (
            <div
              key={i}
              className={`rounded-card px-3 py-3 text-center ${
                i === pickIdx
                  ? "bg-accent-emerald text-white shadow-glow"
                  : "bg-surface-muted text-ink-secondary"
              }`}
            >
              <p className="text-[10px] font-bold uppercase">{labels[i]}</p>
              <p className="font-mono text-lg font-bold tabular-nums">{p}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-analytics p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent-emerald">
          vs Réel ESPN
        </h3>
        {actual ? (
          <>
            <p className="mt-4 font-display text-4xl font-extrabold tabular-nums text-ink">
              {actual}
            </p>
            {(() => {
              const v = getVerdict(enriched.predictedScore, actual);
              const brier = brierScore(enriched.pred, actual);
              const tone =
                v === "exact"
                  ? "text-dz-green"
                  : v === "vainqueur"
                    ? "text-accent-gold"
                    : "text-dz-red";
              return (
                <p className="mt-4 text-sm text-ink-secondary">
                  Verdict :{" "}
                  <span className={`font-bold ${tone}`}>
                    {v ? VERDICT_LABELS[v] : "—"}
                  </span>
                  {" · "}Brier du match :{" "}
                  <span className="font-mono font-semibold">
                    {brier.toFixed(3)}
                  </span>
                  <span className="text-ink-tertiary"> (chance pure : 0,667)</span>
                </p>
              );
            })()}
          </>
        ) : (
          <p className="mt-4 text-sm text-ink-secondary">
            Match à venir — les probabilités restent indicatives jusqu&apos;au
            coup d&apos;envoi.
          </p>
        )}

        <div className="mt-6 rounded-card border border-line-soft bg-surface-muted/80 p-4 text-xs leading-relaxed text-ink-secondary">
          Poisson-Elo + profils attaque/défense, recalibré après chaque résultat
          ESPN. Comparez possession et tirs en direct avec la projection 1X2.
        </div>
      </div>
    </div>
  );
}
