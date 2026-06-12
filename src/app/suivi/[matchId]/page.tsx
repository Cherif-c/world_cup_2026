"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MatchCenterView } from "@/components/suivi/MatchCenterView";
import { useEnrichedMatches } from "@/hooks/useEnrichedMatches";
import type { MatchDetail } from "@/lib/live/match-detail-types";
import { FIXTURES } from "@/data/fixtures";

export default function SuiviMatchPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const enriched = useEnrichedMatches().find((m) => m.id === matchId);
  const fixture = FIXTURES.find((f) => f.id === matchId);

  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const res = await fetch(`/api/match/${matchId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Match introuvable"
          );
        }
        if (!cancelled) {
          setDetail(data as MatchDetail);
          setError(null);
          // Match terminé → inutile de re-poller ESPN toutes les 20 s.
          if ((data as MatchDetail).status === "finished" && interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    interval = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [matchId]);

  if (!fixture) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-secondary">Match inconnu.</p>
        <Link href="/suivi" className="mt-4 inline-block text-accent-emerald">
          ← Retour suivi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/suivi"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-accent-emerald hover:underline"
      >
        ← Tous les matchs
      </Link>

      {loading && !detail && (
        <div className="score-hero animate-pulse p-12 text-center text-ink-onDark-muted">
          Chargement des données ESPN…
        </div>
      )}

      {error && !detail && (
        <div className="card-analytics p-8 text-center text-sm text-dz-red">
          {error}
        </div>
      )}

      {detail && (
        <MatchCenterView
          detail={detail}
          group={fixture.group}
          matchday={fixture.matchday}
          enriched={
            enriched
              ? {
                  predictedScore: enriched.predictedScore,
                  pred: enriched.pred,
                  pick1x2Label: enriched.pick1x2Label,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
