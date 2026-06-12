/**
 * Cotes marché pré-match (décimales 1 / N / 2).
 *
 * ⚠️ CONVENTION CRITIQUE : l'ordre est [domicile, nul, extérieur]
 * tel qu'affiché dans fixtures.ts (équipe `home` d'abord) —
 * JAMAIS favori d'abord. Une inversion contamine pFinal à 65 %
 * via le blend Bühlmann (z = 0.35).
 *
 * Sans entrée → modèle pur (pas de blend).
 * Mettre à jour avec les closing lines réelles avant chaque match.
 */
export const MARKET_ODDS: Record<string, [number, number, number]> = {
  // J1 — Groupe A
  "a-md1-0-1": [1.55, 4.2, 6.5], // Mexique – Afrique du Sud (joué)
  "a-md1-2-3": [2.45, 3.25, 2.95], // Corée du Sud – Tchéquie (joué)
  // J1 — Groupe B
  "b-md1-0-1": [1.8, 3.5, 4.6], // Canada – Bosnie
  "b-md1-2-3": [7.5, 4.4, 1.45], // Qatar – Suisse (Suisse favorite → côté 2)
  // J1 — Groupe C
  "c-md1-0-1": [1.75, 3.6, 4.6], // Brésil – Maroc
  "c-md1-2-3": [6.0, 4.0, 1.57], // Haïti – Écosse (Écosse favorite → côté 2)
  // J1 — Groupe D
  "d-md1-0-1": [1.7, 3.8, 5.0], // États-Unis – Paraguay
  "d-md1-2-3": [3.4, 3.3, 2.15], // Australie – Turquie (Turquie favorite)
  // J1 — Groupe E
  "e-md1-0-1": [1.1, 9.0, 26.0], // Allemagne – Curaçao
  "e-md1-2-3": [2.9, 3.0, 2.65], // Côte d'Ivoire – Équateur (quasi pick'em)
  // J1 — Groupe F
  "f-md1-0-1": [1.95, 3.4, 3.9], // Pays-Bas – Japon
  "f-md1-2-3": [2.3, 3.1, 3.3], // Suède – Tunisie
  // J1 — Groupe G
  "g-md1-0-1": [1.7, 3.6, 5.0], // Belgique – Égypte
  "g-md1-2-3": [1.6, 3.9, 6.0], // Iran – Nouvelle-Zélande
  // J1 — Groupe H
  "h-md1-0-1": [1.06, 12.0, 34.0], // Espagne – Cap-Vert
  "h-md1-2-3": [5.5, 3.7, 1.65], // Arabie saoudite – Uruguay (Uruguay favori → côté 2)
  // J1 — Groupe I
  "i-md1-0-1": [1.55, 4.0, 6.0], // France – Sénégal
  "i-md1-2-3": [6.5, 4.2, 1.5], // Irak – Norvège (Norvège favorite → côté 2)
  // J1 — Groupe J
  "j-md1-0-1": [1.36, 4.8, 8.0], // Argentine – Algérie
  "j-md1-2-3": [1.55, 4.0, 6.0], // Autriche – Jordanie
  // J2 — Groupe J
  "j-md2-0-2": [1.45, 4.5, 7.5], // Argentine – Autriche
  "j-md2-1-3": [1.5, 4.2, 7.0], // Algérie – Jordanie
  // J3 — Groupe J
  "j-md3-0-3": [1.08, 10.0, 26.0], // Argentine – Jordanie
  "j-md3-1-2": [2.9, 3.2, 2.55], // Algérie – Autriche (Autriche légère favorite)
  // J1 — Groupe K
  "k-md1-0-1": [1.3, 5.0, 9.5], // Portugal – RD Congo
  "k-md1-2-3": [5.0, 3.6, 1.7], // Ouzbékistan – Colombie (Colombie favorite → côté 2)
  // J1 — Groupe L
  "l-md1-0-1": [1.75, 3.5, 4.8], // Angleterre – Croatie
  "l-md1-2-3": [2.25, 3.1, 3.4], // Ghana – Panama
};

export function getMarketOdds(matchId: string): [number, number, number] | undefined {
  return MARKET_ODDS[matchId];
}

/**
 * Garde-fou anti-inversion : signale toute ligne dont le favori marché
 * contredit le favori Elo de plus de 250 pts. À appeler en dev
 * (console.warn) — c'est exactement ce qui aurait attrapé les
 * inversions Qatar/Suisse, Haïti/Écosse, etc.
 */
export function auditOddsAgainstElo(
  elo: Record<string, number>,
  fixtures: { id: string; home: string; away: string }[]
): string[] {
  const warnings: string[] = [];
  for (const f of fixtures) {
    const odds = MARKET_ODDS[f.id];
    if (!odds) continue;
    const eloDiff = (elo[f.home] ?? 1700) - (elo[f.away] ?? 1700);
    const marketFavorsHome = odds[0] < odds[2];
    if (eloDiff > 250 && !marketFavorsHome) {
      warnings.push(
        `${f.id} (${f.home} vs ${f.away}) : Elo +${eloDiff} domicile mais marché favorise l'extérieur — cotes inversées ?`
      );
    }
    if (eloDiff < -250 && marketFavorsHome) {
      warnings.push(
        `${f.id} (${f.home} vs ${f.away}) : Elo ${eloDiff} domicile mais marché favorise le domicile — cotes inversées ?`
      );
    }
  }
  return warnings;
}
