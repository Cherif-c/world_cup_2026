/** Noms API-Football attendus pour le matching */
export const TEAM_API_ALIASES: Record<string, string[]> = {
  Mexique: ["mexico"],
  "Afrique du Sud": ["south africa"],
  "Corée du Sud": ["south korea", "korea republic"],
  Tchéquie: ["czech republic", "czechia", "czech"],
  Canada: ["canada"],
  "Bosnie-Herzégovine": [
    "bosnia",
    "bosnia herzegovina",
    "bosnia and herzegovina",
    "bosnia & herzegovina",
    "bosnia-herzegovina",
  ],
  "États-Unis": ["usa", "united states", "united states of america"],
  Paraguay: ["paraguay"],
  Qatar: ["qatar"],
  Suisse: ["switzerland"],
  Brésil: ["brazil"],
  Maroc: ["morocco"],
  Haïti: ["haiti"],
  Écosse: ["scotland"],
  Australie: ["australia"],
  Turquie: ["turkey", "türkiye", "turkiye"],
  Allemagne: ["germany"],
  Curaçao: ["curacao", "curaçao"],
  "Pays-Bas": ["netherlands"],
  Japon: ["japan"],
  "Côte d'Ivoire": ["ivory coast", "cote d'ivoire", "côte d'ivoire"],
  Équateur: ["ecuador"],
  Suède: ["sweden"],
  Tunisie: ["tunisia"],
  Espagne: ["spain"],
  "Cap-Vert": ["cape verde"],
  Belgique: ["belgium"],
  Égypte: ["egypt"],
  "Arabie saoudite": ["saudi arabia"],
  Uruguay: ["uruguay"],
  Iran: ["iran"],
  "Nouvelle-Zélande": ["new zealand"],
  France: ["france"],
  Sénégal: ["senegal"],
  Norvège: ["norway"],
  Irak: ["iraq"],
  Argentine: ["argentina"],
  Algérie: ["algeria"],
  Autriche: ["austria"],
  Jordanie: ["jordan"],
  Portugal: ["portugal"],
  Colombie: ["colombia"],
  Ouzbékistan: ["uzbekistan"],
  "RD Congo": ["dr congo", "congo dr", "congo", "democratic republic of the congo"],
  Angleterre: ["england"],
  Croatie: ["croatia"],
  Ghana: ["ghana"],
  Panama: ["panama"],
};

export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function teamsMatch(ourName: string, apiName: string): boolean {
  const api = normalizeTeamName(apiName);
  const aliases = TEAM_API_ALIASES[ourName] ?? [normalizeTeamName(ourName)];
  return aliases.some(
    (alias) => api === alias || api.includes(alias) || alias.includes(api)
  );
}
