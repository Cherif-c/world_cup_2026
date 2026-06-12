import { AppNav } from "./AppNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
      <footer className="mt-auto bg-fifa-midnight">
        <div className="h-1 bg-dz-stripe-h" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-10">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-white">
              Coupe du Monde FIFA 2026
            </p>
            <p className="mt-1 text-xs text-ink-onDark-muted">
              Modèle Poisson-Elo · Karim × Claude
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-dz-green-bright">
              Algérie
            </span>
            <div className="flex h-3 w-16 overflow-hidden rounded-full">
              <div className="flex-1 bg-dz-green" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-dz-red" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
