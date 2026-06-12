interface StatPillsProps {
  stats: { label: string; value: string | number; accent?: string }[];
}

export function StatPills({ stats }: StatPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {stats.map((s) => (
        <div key={s.label} className="stat-pill">
          <p className="stat-pill-label">{s.label}</p>
          <p className={`stat-pill-value ${s.accent ?? ""}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
