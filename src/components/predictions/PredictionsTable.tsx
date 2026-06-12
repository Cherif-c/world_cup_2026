import {
  computeStats,
  flattenMatches,
  formatDateFr,
  involvesAlgeria,
} from "@/data/matches";
import { brierScore, getVerdict } from "@/lib/scoring";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatPills } from "@/components/ui/StatPills";
import { TeamCell } from "@/components/ui/TeamCell";
import { VerdictBadge } from "@/components/ui/VerdictBadge";

export function PredictionsTable() {
  const matches = flattenMatches();
  const stats = computeStats();

  return (
    <>
      <PageHeader
        title="Prédictions"
        subtitle="Comparaison tabulaire : probabilités 1X2, score prédit vs résultat réel, verdict et score de Brier."
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
            { label: "Restants", value: stats.upcoming },
          ]}
        />
      </PageHeader>

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
                const verdict = getVerdict(m.predictedScore, m.result);
                const brier =
                  m.result !== null
                    ? brierScore(m.pred, m.result)
                    : null;
                const algeria = involvesAlgeria(m);

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
                    <td className="text-center font-display text-base font-bold">
                      {m.result ? (
                        <span className="text-dz-green">{m.result}</span>
                      ) : (
                        <span className="text-ink-tertiary">—</span>
                      )}
                    </td>
                    <td>
                      <VerdictBadge verdict={verdict} />
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
              <p
                key={m.id}
                className="callout-dz text-xs"
              >
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
