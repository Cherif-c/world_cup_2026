/**
 * Ajustements attaque / défense vs le baseline Elo.
 * Plus d'attaque → plus de buts marqués · plus de défense → moins de buts encaissés.
 * Calibré sur profils récents (CAN, qualifs, niveau attendu CDM).
 */
export interface StrengthAdj {
  attack: number;
  defense: number;
}

export const TEAM_STRENGTH: Record<string, StrengthAdj> = {
  // ——— Groupe A ———
  Mexique: { attack: 0.12, defense: 0.08 },
  "Afrique du Sud": { attack: -0.05, defense: 0.0 },
  "Corée du Sud": { attack: 0.08, defense: 0.12 },
  Tchéquie: { attack: 0.05, defense: 0.1 },

  // ——— Groupe B ———
  Canada: { attack: 0.05, defense: -0.02 },
  "Bosnie-Herzégovine": { attack: 0.02, defense: 0.0 },
  Qatar: { attack: -0.15, defense: -0.25 },
  Suisse: { attack: 0.08, defense: 0.18 },

  // ——— Groupe C ———
  Brésil: { attack: 0.35, defense: 0.15 },
  Maroc: { attack: 0.15, defense: 0.22 },
  Haïti: { attack: -0.35, defense: -0.45 },
  Écosse: { attack: 0.02, defense: 0.12 },

  // ——— Groupe D ———
  "États-Unis": { attack: 0.1, defense: 0.08 },
  Paraguay: { attack: -0.02, defense: 0.0 },
  Australie: { attack: 0.05, defense: 0.05 },
  Turquie: { attack: 0.12, defense: 0.02 },

  // ——— Groupe E ———
  Allemagne: { attack: 0.28, defense: 0.18 },
  Curaçao: { attack: -0.4, defense: -0.5 },
  "Côte d'Ivoire": { attack: 0.12, defense: 0.05 },
  Équateur: { attack: 0.1, defense: 0.08 },

  // ——— Groupe F ———
  "Pays-Bas": { attack: 0.3, defense: 0.1 },
  Japon: { attack: 0.15, defense: 0.15 },
  Suède: { attack: 0.05, defense: 0.08 },
  Tunisie: { attack: -0.02, defense: 0.05 },

  // ——— Groupe G ———
  Belgique: { attack: 0.25, defense: 0.05 },
  Iran: { attack: 0.05, defense: 0.12 },
  Égypte: { attack: 0.08, defense: 0.02 },
  "Nouvelle-Zélande": { attack: -0.35, defense: -0.4 },

  // ——— Groupe H ———
  Espagne: { attack: 0.38, defense: 0.22 },
  Uruguay: { attack: 0.18, defense: 0.2 },
  "Arabie saoudite": { attack: -0.08, defense: -0.15 },
  "Cap-Vert": { attack: -0.3, defense: -0.38 },

  // ——— Groupe I ———
  France: { attack: 0.32, defense: 0.2 },
  Sénégal: { attack: 0.15, defense: 0.12 },
  Norvège: { attack: 0.18, defense: 0.08 },
  Irak: { attack: -0.12, defense: -0.18 },

  // ——— Groupe J ———
  Argentine: { attack: 0.32, defense: 0.18 },
  Algérie: { attack: 0.4, defense: 0.28 },
  Autriche: { attack: 0.1, defense: 0.12 },
  Jordanie: { attack: -0.38, defense: -0.62 },

  // ——— Groupe K ———
  Portugal: { attack: 0.28, defense: 0.15 },
  Colombie: { attack: 0.18, defense: 0.08 },
  Ouzbékistan: { attack: -0.05, defense: -0.08 },
  "RD Congo": { attack: 0.0, defense: -0.12 },

  // ——— Groupe L ———
  Angleterre: { attack: 0.3, defense: 0.18 },
  Croatie: { attack: 0.12, defense: 0.15 },
  Ghana: { attack: 0.05, defense: -0.02 },
  Panama: { attack: -0.15, defense: -0.22 },
};

export function defaultStrengthFor(team: string): StrengthAdj {
  return TEAM_STRENGTH[team] ?? { attack: 0, defense: 0 };
}
