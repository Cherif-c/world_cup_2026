import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const outfitSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CDM 2026 — Prédictions vs Résultats",
  description:
    "Calendrier des matchs, prédictions du modèle Poisson-Elo et comparaison aux scores réels — Coupe du Monde FIFA 2026.",
  openGraph: {
    title: "CDM 2026 — Prédictions",
    description: "Suivi des prédictions Coupe du Monde 2026",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${outfit.variable} ${outfitSans.variable} ${jetbrains.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
