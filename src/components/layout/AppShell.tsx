import { AppNav } from "./AppNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="border-t border-line-soft bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-ink-tertiary sm:px-6 lg:px-8">
          <span>CDM 2026 · Modèle Poisson-Elo · Karim × Claude</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-dz-green" />
            <span className="inline-block h-2 w-2 rounded-full bg-dz-white ring-1 ring-line" />
            <span className="inline-block h-2 w-2 rounded-full bg-dz-red" />
          </span>
        </div>
      </footer>
    </div>
  );
}
