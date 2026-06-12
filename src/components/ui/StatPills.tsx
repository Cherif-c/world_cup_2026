interface StatPillsProps {
  stats: { label: string; value: string | number; accent?: string }[];
}

export function StatPills({ stats }: StatPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-apple border border-line-soft bg-surface px-4 py-2 shadow-table"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-tertiary">
            {s.label}
          </p>
          <p
            className={`font-display text-lg font-bold ${s.accent ?? "text-fifa-navy"}`}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
