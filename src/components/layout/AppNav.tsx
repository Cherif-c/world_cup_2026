"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/predictions", label: "Prédictions" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/parametres", label: "Paramètres" },
  { href: "/doc", label: "Documentation" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/predictions" className="flex shrink-0 items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-fifa-gold/40">
            <Image
              src="https://flagcdn.com/w80/dz.png"
              alt="Algérie"
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold tracking-tight text-fifa-navy">
              CDM 2026
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-fifa-gold">
              Pricing Engine
            </p>
          </div>
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {NAV.map(({ href, label }) => {
            const active =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-fifa-navy text-white shadow-sm"
                    : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
          <div className="h-6 w-1 rounded-full bg-dz-green" />
          <div className="h-6 w-1 rounded-full bg-dz-white ring-1 ring-line" />
          <div className="h-6 w-1 rounded-full bg-dz-red" />
        </div>
      </div>
    </header>
  );
}
