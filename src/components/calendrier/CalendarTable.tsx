import {
  flattenMatches,
  formatDateFr,
  involvesAlgeria,
} from "@/data/matches";
import { PageHeader } from "@/components/ui/PageHeader";
import { TeamCell } from "@/components/ui/TeamCell";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { getVerdict } from "@/lib/scoring";

export function CalendarTable() {
  const matches = flattenMatches();
  const played = matches.filter((m) => m.result).length;

  return (
    <>
      <PageHeader
        title="Calendrier"
        subtitle="Programme complet de la phase de poules — journée 1 à 7."
      >
        <div className="rounded-apple border border-line-soft bg-surface px-4 py-2 text-sm">
          <span className="text-ink-tertiary">Progression </span>
          <span className="font-semibold text-fifa-navy">
            {played}/{matches.length}
          </span>
          <span className="text-ink-tertiary"> matchs joués</span>
        </div>
      </PageHeader>

      <div className="card-pro overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-pro">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Grp</th>
                <th>Domicile</th>
                <th className="text-center">—</th>
                <th>Extérieur</th>
                <th>Stade</th>
                <th className="text-center">Score</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const verdict = getVerdict(m.predictedScore, m.result);
                return (
                  <tr
                    key={m.id}
                    className={involvesAlgeria(m) ? "row-algeria" : undefined}
                  >
                    <td className="whitespace-nowrap text-sm font-medium text-ink">
                      {formatDateFr(m.date)}
                    </td>
                    <td className="font-mono text-xs text-ink-secondary">
                      {m.kickoff}
                    </td>
                    <td>
                      <span className="rounded bg-fifa-navy/5 px-1.5 py-0.5 font-mono text-xs font-semibold text-fifa-navy">
                        {m.group}
                      </span>
                    </td>
                    <td>
                      <TeamCell team={m.home} />
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
                    <td className="max-w-[200px] truncate text-xs text-ink-secondary">
                      {m.venue}
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
