"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/predictions", label: "Prédictions" },
  { href: "/classement", label: "Classement" },
  { href: "/parametres", label: "Paramètres" },
  { href: "/doc", label: "Documentation" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-surface/95 shadow-nav backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/predictions"
          className="flex shrink-0 flex-col transition opacity-90 hover:opacity-100"
        >
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            CDM 2026
          </span>
          <span className="text-[11px] text-ink-tertiary">Pricing Engine</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {NAV.map(({ href, label }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-card px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-surface-muted text-ink"
                    : "text-ink-secondary hover:bg-surface-muted/60 hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
