"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlagIcon } from "@/components/ui/FlagIcon";

const NAV = [
  { href: "/predictions", label: "Prédictions" },
  { href: "/classement", label: "Classement" },
  { href: "/parametres", label: "Paramètres" },
  { href: "/doc", label: "Documentation" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 shadow-nav">
      <div className="h-1 bg-dz-stripe-h" />

      <div className="bg-fifa-header">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/predictions"
            className="flex shrink-0 items-center gap-3 rounded-card px-2 py-1 transition hover:bg-white/5"
          >
            <div className="overflow-hidden rounded-full ring-2 ring-dz-green ring-offset-1 ring-offset-fifa-blue-dark">
              <FlagIcon team="Algérie" size={36} className="rounded-full" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-sm font-extrabold uppercase tracking-wide text-white">
                CDM 2026
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dz-green-bright">
                Pricing Engine
              </p>
            </div>
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto py-1">
            {NAV.map(({ href, label }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`whitespace-nowrap rounded-card px-3.5 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                    active
                      ? "bg-dz-green text-white shadow-md shadow-dz-green/30"
                      : "text-ink-onDark-muted hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden h-8 w-1.5 shrink-0 overflow-hidden rounded-full lg:block">
            <div className="h-full w-full bg-dz-stripe-v" />
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-fifa-blue-mid" />
    </header>
  );
}
