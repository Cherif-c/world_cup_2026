import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { LiveScoresProvider } from "@/context/LiveScoresContext";
import { ModelProvider } from "@/context/ModelContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CDM 2026 — Pricing Engine",
  description:
    "Prédictions, calendrier et modèle Poisson-Elo pour la Coupe du Monde FIFA 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${interDisplay.variable}`}
    >
      <body className="font-sans">
        <ModelProvider>
          <LiveScoresProvider>
            <AppShell>{children}</AppShell>
          </LiveScoresProvider>
        </ModelProvider>
      </body>
    </html>
  );
}
