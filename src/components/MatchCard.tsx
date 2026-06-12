import type { Match } from "@/data/matches";
import {
  VERDICT_LABELS,
  brierScore,
  getVerdict,
  type Verdict,
} from "@/lib/scoring";
import { TeamFlag } from "./TeamFlag";

const VERDICT_STYLES: Record<
  Exclude<Verdict, null>,
  { bg: string; text: string; ring: string }
> = {
  exact: {
    bg: "bg-turf-500/20",
    text: "text-turf-400",
    ring: "ring-turf-500/40",
  },
  vainqueur: {
    bg: "bg-gold-500/20",
    text: "text-gold-400",
    ring: "ring-gold-500/40",
  },
  rate: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    ring: "ring-red-500/40",
  },
};

interface MatchCardProps {
  match: Match;
  index: number;
}

export function MatchCard({ match, index }: MatchCardProps) {
  const verdict = getVerdict(match.predictedScore, match.result);
  const brier =
    match.result !== null ? brierScore(match.pred, match.result) : null;
  const isUpcoming = match.result === null;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-pitch-800/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-pitch-700/70 hover:shadow-xl hover:shadow-turf-500/5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-card-shine opacity-0 transition-opacity group-hover:opacity-100" />

      {verdict && (
        <div
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${VERDICT_STYLES[verdict].bg} ${VERDICT_STYLES[verdict].text} ${VERDICT_STYLES[verdict].ring}`}
        >
          {VERDICT_LABELS[verdict]}
        </div>
      )}

      {isUpcoming && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-turf-400" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
            À venir
          </span>
        </div>
      )}

      {/* Teams */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <TeamRow team={match.home} align="left" />
        <span className="shrink-0 font-mono text-xs font-semibold text-white/25">
          VS
        </span>
        <TeamRow team={match.away} align="right" />
      </div>

      <p className="mb-4 font-mono text-[10px] uppercase tracking-wider text-white/30">
        {match.venue}
      </p>

      {/* 1X2 bar */}
      <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="bg-white/80 transition-all"
          style={{ width: `${match.pred[0]}%` }}
        />
        <div
          className="bg-white/35 transition-all"
          style={{ width: `${match.pred[1]}%` }}
        />
        <div
          className="bg-gold-500 transition-all"
          style={{ width: `${match.pred[2]}%` }}
        />
      </div>
      <div className="mb-5 flex justify-between font-mono text-[10px] text-white/40">
        <span>
          1 · {match.pred[0]}%
        </span>
        <span>N · {match.pred[1]}%</span>
        <span>2 · {match.pred[2]}%</span>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-black/25 p-3">
        <ScoreCell label="Prédit" value={match.predictedScore} highlight />
        <ScoreCell
          label="Réel"
          value={match.result ?? "—"}
          muted={isUpcoming}
        />
        <ScoreCell
          label="Brier"
          value={brier !== null ? brier.toFixed(3) : "—"}
          muted={brier === null}
          accent
        />
      </div>

      {match.revision && (
        <p className="mt-3 rounded-lg border border-gold-500/20 bg-gold-500/5 px-3 py-2 text-xs leading-relaxed text-gold-400/80">
          {match.revision}
        </p>
      )}
    </article>
  );
}

function TeamRow({
  team,
  align,
}: {
  team: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2.5 ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <TeamFlag team={team} size={36} />
      <span
        className={`truncate font-display text-sm font-bold uppercase leading-tight text-white sm:text-base ${align === "right" ? "text-right" : ""}`}
      >
        {team}
      </span>
    </div>
  );
}

function ScoreCell({
  label,
  value,
  highlight,
  muted,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="font-mono text-[9px] uppercase tracking-widest text-white/30">
        {label}
      </p>
      <p
        className={`font-display text-xl font-bold ${
          muted
            ? "text-white/20"
            : accent
              ? "text-gold-400"
              : highlight
                ? "text-white"
                : "text-turf-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
