import { MatchDay } from "@/components/MatchDay";
import { StatsHeader } from "@/components/StatsHeader";
import { MATCH_DAYS, computeStats } from "@/data/matches";

export default function HomePage() {
  const stats = computeStats();

  return (
    <main className="relative min-h-screen">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 bg-hero-glow" />
      <div className="pointer-events-none fixed -left-32 top-1/4 h-96 w-96 rounded-full bg-turf-500/5 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 bottom-1/4 h-96 w-96 rounded-full bg-gold-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <StatsHeader
          exact={stats.exact}
          vainqueur={stats.vainqueur}
          rate={stats.rate}
          avgBrier={stats.avgBrier}
          upcoming={stats.upcoming}
          played={stats.played}
        />

        <div className="space-y-12">
          {MATCH_DAYS.map((day, i) => (
            <MatchDay key={day.id} day={day} dayIndex={i} />
          ))}
        </div>

        <footer className="mt-16 border-t border-white/8 pt-8 font-mono text-xs leading-relaxed text-white/30">
          <p>
            Modèle : Poisson bivarié à intensités Elo, correction Dixon-Coles
            (ρ = −0,10), crédibilité marché z = 0,35 —{" "}
            <code className="text-gold-400/70">wc26_model.py</code>
          </p>
          <p className="mt-2">
            Brier multiclasse : BS = Σ (p<sub>i</sub> − o<sub>i</sub>)² ·
            Référence chance pure (⅓,⅓,⅓) : 0,667
          </p>
        </footer>
      </div>
    </main>
  );
}
