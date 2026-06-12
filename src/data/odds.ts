/**
 * Cotes marché pré-match (décimales 1 / N / 2).
 * Mettre à jour après publication des lines bookmakers.
 * Sans entrée → modèle pur (pas de blend Bühlmann).
 */
export const MARKET_ODDS: Record<string, [number, number, number]> = {
  // J1 — Groupe A
  "a-md1-0-1": [1.55, 4.2, 6.5],
  "a-md1-2-3": [2.45, 3.25, 2.95],
  // J1 — Groupe B
  "b-md1-0-1": [2.1, 3.4, 3.5],
  "b-md1-2-3": [1.65, 3.8, 5.5],
  // J1 — Groupe C
  "c-md1-0-1": [1.45, 4.5, 7.0],
  "c-md1-2-3": [1.85, 3.6, 4.2],
  // J1 — Groupe D
  "d-md1-0-1": [1.7, 3.8, 5.0],
  "d-md1-2-3": [2.05, 3.35, 3.6],
  // J1 — Groupe E
  "e-md1-0-1": [1.25, 6.0, 11.0],
  "e-md1-2-3": [1.55, 4.0, 6.0],
  // J1 — Groupe F
  "f-md1-0-1": [1.5, 4.2, 6.5],
  "f-md1-2-3": [1.9, 3.5, 4.0],
  // J1 — Groupe G
  "g-md1-0-1": [1.35, 5.0, 8.5],
  "g-md1-2-3": [1.6, 3.9, 5.5],
  // J1 — Groupe H
  "h-md1-0-1": [1.3, 5.5, 9.0],
  "h-md1-2-3": [1.75, 3.6, 4.8],
  // J1 — Groupe I
  "i-md1-0-1": [1.35, 5.0, 8.0],
  "i-md1-2-3": [1.65, 3.8, 5.2],
  // J1 — Groupe J (Algérie)
  "j-md1-0-1": [1.55, 4.0, 6.5],
  "j-md1-2-3": [1.55, 4.0, 6.0],
  // J2 — Groupe J
  "j-md2-0-2": [1.45, 4.5, 7.5],
  "j-md2-1-3": [1.22, 6.5, 12.0],
  // J3 — Groupe J
  "j-md3-0-3": [1.08, 10.0, 26.0],
  "j-md3-1-2": [2.35, 3.35, 3.0],
  // J1 — Groupe K
  "k-md1-0-1": [1.42, 4.6, 7.5],
  "k-md1-2-3": [1.7, 3.7, 4.9],
  // J1 — Groupe L
  "l-md1-0-1": [1.32, 5.2, 9.5],
  "l-md1-2-3": [1.58, 3.9, 5.8],
};

export function getMarketOdds(matchId: string): [number, number, number] | undefined {
  return MARKET_ODDS[matchId];
}
