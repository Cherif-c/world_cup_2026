/** Poules CDM 2026 — ordre calibré sur le round-robin J1 réel */
export const GROUPS: Record<string, readonly [string, string, string, string]> = {
  A: ["Mexique", "Afrique du Sud", "Corée du Sud", "Tchéquie"],
  B: ["Canada", "Bosnie-Herzégovine", "Qatar", "Suisse"],
  C: ["Brésil", "Maroc", "Haïti", "Écosse"],
  D: ["États-Unis", "Paraguay", "Australie", "Turquie"],
  E: ["Allemagne", "Curaçao", "Côte d'Ivoire", "Équateur"],
  F: ["Pays-Bas", "Japon", "Suède", "Tunisie"],
  G: ["Belgique", "Égypte", "Iran", "Nouvelle-Zélande"],
  H: ["Espagne", "Cap-Vert", "Arabie saoudite", "Uruguay"],
  I: ["France", "Sénégal", "Irak", "Norvège"],
  J: ["Argentine", "Algérie", "Autriche", "Jordanie"],
  K: ["Portugal", "RD Congo", "Ouzbékistan", "Colombie"],
  L: ["Angleterre", "Croatie", "Ghana", "Panama"],
};

export const GROUP_IDS = Object.keys(GROUPS).sort();
