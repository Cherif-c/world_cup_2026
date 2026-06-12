"use client";

import type { MatchStatRow } from "@/lib/live/match-detail-types";

export function StatCompare({
  rows,
  home,
  away,
}: {
  rows: MatchStatRow[];
  home: string;
  away: string;
}) {
  const visible = rows.filter(
    (r) => r.home != null || r.away != null
  );

  if (visible.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-ink-tertiary">
        Stats disponibles au coup d&apos;envoi.
      </p>
    );
  }

  return (
    <div className="divide-y divide-line-soft">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">
        <span className="truncate text-right">{home}</span>
        <span className="w-28 text-center">Stat</span>
        <span className="truncate">{away}</span>
      </div>
      {visible.map((row) => {
        const h = row.home ?? 0;
        const a = row.away ?? 0;
        const total = h + a || 1;
        const homePct = row.bar ? h : (h / total) * 100;
        const awayPct = row.bar ? a : (a / total) * 100;

        return (
          <div key={row.key} className="px-5 py-3">
            <div className="mb-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="text-right font-mono text-sm font-bold tabular-nums text-ink">
                {row.home ?? "—"}
                {row.bar && row.home != null ? "%" : ""}
              </span>
              <span className="w-28 text-center text-xs font-semibold text-ink-secondary">
                {row.label}
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-ink">
                {row.away ?? "—"}
                {row.bar && row.away != null ? "%" : ""}
              </span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="bg-accent-emerald transition-all"
                style={{ width: `${homePct}%` }}
              />
              <div
                className="bg-dz-red/80 transition-all"
                style={{ width: `${awayPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
