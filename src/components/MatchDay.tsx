import type { MatchDay as MatchDayType } from "@/data/matches";
import { MatchCard } from "./MatchCard";

interface MatchDayProps {
  day: MatchDayType;
  dayIndex: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function MatchDay({ day, dayIndex }: MatchDayProps) {
  const played = day.matches.filter((m) => m.result !== null).length;
  const total = day.matches.length;

  return (
    <section className="animate-fade-up" style={{ animationDelay: `${dayIndex * 100}ms` }}>
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-turf-500 to-turf-600 font-display text-sm font-bold text-pitch-950 shadow-lg shadow-turf-500/20">
          J{dayIndex + 1}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
            {day.title}
          </h2>
          <p className="font-mono text-xs capitalize text-white/40">
            {formatDate(day.date)} · {played}/{total} joués
          </p>
        </div>
        <div className="hidden h-px flex-1 bg-gradient-to-r from-white/10 to-transparent sm:block" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
        {day.matches.map((match, i) => (
          <MatchCard key={match.id} match={match} index={i} />
        ))}
      </div>
    </section>
  );
}
