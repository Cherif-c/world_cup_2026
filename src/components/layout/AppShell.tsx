import { AppNav } from "./AppNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
      <footer className="border-t border-line-soft bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <p className="text-xs text-ink-tertiary">
            Coupe du Monde FIFA 2026 · Modèle Poisson-Elo
          </p>
          <p className="text-xs text-ink-tertiary">Scores ESPN</p>
        </div>
      </footer>
    </div>
  );
}
