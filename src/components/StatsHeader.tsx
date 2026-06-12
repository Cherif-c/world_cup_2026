interface StatsHeaderProps {
  exact: number;
  vainqueur: number;
  rate: number;
  avgBrier: number | null;
  upcoming: number;
  played: number;
}

export function StatsHeader({
  exact,
  vainqueur,
  rate,
  avgBrier,
  upcoming,
  played,
}: StatsHeaderProps) {
  const accuracy =
    played > 0 ? Math.round(((exact + vainqueur) / played) * 100) : null;

  return (
    <header className="relative mb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.3em] text-turf-400">
            Coupe du Monde · USA · Canada · Mexique
          </p>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            Prédictions
            <span className="block bg-gradient-to-r from-turf-400 via-gold-400 to-turf-500 bg-clip-text text-transparent">
              CDM 2026
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/50">
            Modèle Poisson-Elo · Dixon-Coles · Suivi en direct des scores réels
            vs prévisions
          </p>
        </div>

        {accuracy !== null && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Précision 1X2
            </p>
            <p className="font-display text-4xl font-bold text-gold-400">
              {accuracy}%
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <StatCard
          label="Scores exacts"
          value={exact}
          accent="text-turf-400"
          border="border-turf-500/30"
        />
        <StatCard
          label="Bon vainqueur"
          value={vainqueur}
          accent="text-gold-400"
          border="border-gold-500/30"
        />
        <StatCard
          label="Ratés"
          value={rate}
          accent="text-red-400"
          border="border-red-500/30"
        />
        <StatCard
          label="Brier moyen"
          value={avgBrier !== null ? avgBrier.toFixed(3) : "—"}
          sub="réf. chance : 0.667"
          accent="text-white"
          border="border-white/10"
        />
      </div>

      <p className="mt-4 font-mono text-xs text-white/30">
        {upcoming} match{upcoming > 1 ? "s" : ""} à venir · {played} joué
        {played > 1 ? "s" : ""}
      </p>
    </header>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  border,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  border: string;
}) {
  return (
    <div
      className={`rounded-xl border ${border} bg-pitch-800/60 px-4 py-3 backdrop-blur-sm`}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </p>
      <p className={`font-display text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="font-mono text-[10px] text-white/25">{sub}</p>}
    </div>
  );
}
